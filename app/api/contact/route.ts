import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { rateLimitRequest, rateLimitResponse } from '@/lib/rate-limit'
import { contactSchema, validateRequest } from '@/lib/validation'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function getAdminEmail(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'support_email')
      .single()
    if (data?.value) {
      const val = typeof data.value === 'string' ? data.value.replace(/"/g, '') : String(data.value)
      return val || null
    }
  } catch { /* ignore */ }
  return null
}

async function sendContactNotification(name: string, email: string, subject: string, message: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const adminEmail = await getAdminEmail()
  if (!adminEmail) return

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@verifydummytickets.com'

    // All user-supplied values are HTML-encoded before insertion
    const safeName    = escapeHtml(name)
    const safeEmail   = escapeHtml(email)
    const safeSubject = escapeHtml(subject)
    const safeMessage = escapeHtml(message)

    await resend.emails.send({
      from: `Verify Dummy Tickets <${fromEmail}>`,
      to: [adminEmail],
      subject: `New Contact Message: ${safeSubject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #c8143d; margin-bottom: 24px;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6b7280; width: 100px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${safeName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #c8143d;">${safeEmail}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Subject</td><td style="padding: 8px 0;">${safeSubject}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; margin-bottom: 8px;">Message</p>
          <p style="color: #1f2937; white-space: pre-wrap;">${safeMessage}</p>
        </div>
      `,
    })
  } catch {
    // Fire-and-forget — do not surface email errors to the client
  }
}

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
  
  // Rate limiting — 5 contact submissions per minute per IP (Redis-backed)
  const { success, resetIn } = await rateLimitRequest(request, "contact")
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

    // Fire-and-forget email notification to admin
    sendContactNotification(sanitizedName, sanitizedEmail, sanitizedSubject, sanitizedMessage)

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
