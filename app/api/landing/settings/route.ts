import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('is_public', true)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    const settings: Record<string, any> = {}
    data?.forEach((item) => {
      settings[item.key] = item.value
    })
    
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  
  const { error: authError } = await requireAdmin()
  if (authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Handle bulk update
    if (body.settings && Array.isArray(body.settings)) {
      const now = new Date().toISOString()
      const results = []
      
      for (const setting of body.settings) {
        const { key, value, category = 'general' } = setting
        
        const { data: existing } = await supabase
          .from('site_settings')
          .select('id')
          .eq('key', key)
          .single()
        
        if (existing) {
          const { data, error } = await supabase
            .from('site_settings')
            .update({ value, updated_at: now })
            .eq('key', key)
            .select()
            .single()
          
          if (error) {
            results.push({ key, error: error.message })
          } else {
            results.push({ key, success: true })
          }
        } else {
          const { data, error } = await supabase
            .from('site_settings')
            .insert([{ key, value, category, is_public: true, updated_at: now }])
            .select()
            .single()
          
          if (error) {
            results.push({ key, error: error.message })
          } else {
            results.push({ key, success: true })
          }
        }
      }
      
      return NextResponse.json({ success: true, results })
    }
    
    // Handle single update
    const { key, value, category = 'general' } = body
    
    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', key)
      .single()
    
    if (existing) {
      const { data, error } = await supabase
        .from('site_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)
        .select()
        .single()
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    } else {
      const { data, error } = await supabase
        .from('site_settings')
        .insert([{ key, value, category, is_public: true }])
        .select()
        .single()
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
