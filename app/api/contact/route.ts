import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  
  try {
    const { user, error: authError } = await requireAdmin()
    if (authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error: dbError } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  
  try {
    const body = await request.json()
    const { name, email, subject, message } = body
    
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }
    
    // Sanitize inputs
    const sanitizedName = name.toString().slice(0, 200)
    const sanitizedEmail = email.toString().slice(0, 200)
    const sanitizedSubject = subject?.toString().slice(0, 200) || ''
    const sanitizedMessage = message.toString().slice(0, 5000)
    
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{ name: sanitizedName, email: sanitizedEmail, subject: sanitizedSubject, message: sanitizedMessage }])
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  
  try {
    const { user, error: authError } = await requireAdmin()
    if (authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, is_read } = body
    
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ is_read })
      .eq('id', id)
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  
  try {
    const { user, error: authError } = await requireAdmin()
    if (authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
