import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET() {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('faq_item')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { error: authError } = await requireAdmin()
  if (authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('faq_item')
      .insert([body])
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 })
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
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('faq_item')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  
  const { error: authError } = await requireAdmin()
  if (authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    
    const { error } = await supabase
      .from('faq_item')
      .delete()
      .eq('id', id)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 })
  }
}
