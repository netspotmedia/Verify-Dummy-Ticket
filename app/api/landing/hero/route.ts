import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET() {
  const supabase = await createClient()
  
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
  const supabase = await createClient()
  
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
  const supabase = await createClient()
  
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
