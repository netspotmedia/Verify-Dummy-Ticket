import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  if (!supabase) {
    return NextResponse.json([], { status: 200 })
  }

  try {
    const { data, error } = await supabase
      .from('airline')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching airlines:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { name, code, logo_url, sort_order, is_active } = body

    const { data, error } = await supabase
      .from('airline')
      .insert({ name, code, logo_url, sort_order, is_active })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating airline:', error)
    return NextResponse.json({ error: 'Failed to create airline' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { id, name, code, logo_url, sort_order, is_active } = body

    const { data, error } = await supabase
      .from('airline')
      .update({ name, code, logo_url, sort_order, is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating airline:', error)
    return NextResponse.json({ error: 'Failed to update airline' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('airline')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting airline:', error)
    return NextResponse.json({ error: 'Failed to delete airline' }, { status: 500 })
  }
}
