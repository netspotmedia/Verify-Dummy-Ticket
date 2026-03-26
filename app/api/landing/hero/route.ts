import { NextRequest, NextResponse } from 'next/server'
import { supabase, HeroSection } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  
  try {
    const { data, error } = await supabase
      .from('hero_section')
      .select('*')
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(null)
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch hero section' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  
  const { user, error: authError } = await requireAdmin()
  if (authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    const { data, error } = await supabase
      .from('hero_section')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update hero section' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  
  const { user, error: authError } = await requireAdmin()
  if (authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('hero_section')
      .insert([body])
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create hero section' }, { status: 500 })
  }
}
