import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET() {
  const supabase = await createClient()
  
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
  const supabase = await createClient()
  
  const { error: authError } = await requireAdmin()
  if (authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const now = new Date().toISOString()
    
    if (body.settings && Array.isArray(body.settings)) {
      const results = []
      
      const existingSettings = await supabase
        .from('site_settings')
        .select('key')
        .in('key', body.settings.map((s: { key: string }) => s.key))
      
      const existingKeys = new Set(existingSettings.data?.map(s => s.key) || [])
      
      const toUpdate = body.settings.filter((s: { key: string }) => existingKeys.has(s.key))
      const toInsert = body.settings.filter((s: { key: string }) => !existingKeys.has(s.key))
      
      for (const setting of toUpdate) {
        const { key, value } = setting
        const { error } = await supabase
          .from('site_settings')
          .update({ value, updated_at: now })
          .eq('key', key)
        
        results.push({ key, success: !error, error: error?.message })
      }
      
      if (toInsert.length > 0) {
        const insertRows = toInsert.map((s: { key: string; value: any; category?: string }) => ({
          key: s.key,
          value: s.value,
          category: s.category || 'general',
          is_public: true,
          updated_at: now
        }))
        
        const { error } = await supabase.from('site_settings').insert(insertRows)
        for (const setting of toInsert) {
          results.push({ key: setting.key, success: !error, error: error?.message })
        }
      }
      
      return NextResponse.json({ success: true, results })
    }
    
    const { key, value, category = 'general' } = body
    
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
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    } else {
      const { data, error } = await supabase
        .from('site_settings')
        .insert([{ key, value, category, is_public: true, updated_at: now }])
        .select()
        .single()
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
