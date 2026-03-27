import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { user, error: authError } = await requireAdmin()
  if (authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const orderId = formData.get('orderId') as string | null
    const fileType = formData.get('fileType') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileName = `${orderId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `documents/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('public')
      .getPublicUrl(filePath)

    const { data: docData, error: docError } = await supabase
      .from('order_documents')
      .insert({
        order_id: orderId,
        file_name: file.name,
        file_type: fileType || file.type,
        file_url: urlData.publicUrl,
        file_size: file.size,
        uploaded_by: user?.id,
      })
      .select()
      .single()

    if (docError) {
      console.error('Document record error:', docError)
      return NextResponse.json({ error: docError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      document: docData,
      url: urlData.publicUrl,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { error: authError } = await requireAdmin()
  if (authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('order_documents')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  const { user, error: authError } = await requireAdmin()
  if (authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const documentId = searchParams.get('id')

  if (!documentId) {
    return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('order_documents')
      .delete()
      .eq('id', documentId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
