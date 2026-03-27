import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { rateLimit, getRateLimitIdentifier, rateLimitResponse } from '@/lib/rate-limit'
import { contactSchema, validateRequest } from '@/lib/validation'

export async function GET() {
  const supabase = await createClient()
  
  try {
    const { error: authError } = await requireAdmin()
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
  const supabase = await createClient()
  
  // Rate limiting - 5 submissions per minute per IP
  const identifier = getRateLimitIdentifier(request)
  const { success, resetIn } = rateLimit(identifier, 5, 60000)
  if (!success) {
    return rateLimitResponse(resetIn)
  }
  
  try {
    const body = await request.json()
    
    // Validate input
    const validation = validateRequest(contactSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    
    const { name, email, subject, message } = validation.data
    
    // Sanitize inputs
    const sanitizedName = name.slice(0, 200)
    const sanitizedEmail = email.slice(0, 200)
    const sanitizedSubject = (subject || '').slice(0, 200)
    const sanitizedMessage = message.slice(0, 5000)
    
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
  const supabase = await createClient()
  
  try {
    const { error: authError } = await requireAdmin()
    if (authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, is_read } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
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
  const supabase = await createClient()
  
  try {
    const { error: authError } = await requireAdmin()
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
