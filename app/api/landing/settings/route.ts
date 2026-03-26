import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
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
  try {
    const body = await request.json()
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
