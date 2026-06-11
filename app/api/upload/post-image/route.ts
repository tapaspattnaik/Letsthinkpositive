import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

// Generic image upload for wall posts (community + circles).
// Returns { imageUrl } — the client attaches it to the post on submit.

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Sign in to attach images.' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('image') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type))
    return NextResponse.json({ error: 'Only JPEG, PNG, WebP or GIF allowed' }, { status: 400 })
  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: 'File must be under 5 MB' }, { status: 400 })

  const ext      = file.type.split('/')[1].replace('jpeg', 'jpg')
  const filename = `post-${session.user.id}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'posts')
  await mkdir(uploadDir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(uploadDir, filename), buffer)

  return NextResponse.json({ imageUrl: `/uploads/posts/${filename}` })
}
