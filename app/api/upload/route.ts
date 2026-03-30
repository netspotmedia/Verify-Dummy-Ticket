import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-helpers'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
])

function sanitizeFilename(filename: string): string {
  const name = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  return name.slice(0, 120)
}

function buildUserScopedPath(userId: string, originalFilename: string): string {
  const safeName = sanitizeFilename(originalFilename || 'upload.bin')
  return `uploads/${userId}/${Date.now()}-${safeName}`
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { user, error: authError } = await requireAuth()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'File size must be between 1 byte and 5 MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filePath = buildUserScopedPath(user.id, file.name)

    const { data, error } = await supabase.storage
      .from('public')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('public')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
