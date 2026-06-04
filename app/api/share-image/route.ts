import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'

// Saves a canvas-generated image to public/uploads/shared/ and returns a
// shareable ID. The /share/[id] page then sets proper og:image meta tags
// so Twitter, Facebook etc. show a real image preview in link cards.
export async function POST(req: NextRequest) {
  try {
    const { imageData } = await req.json() // data:image/png;base64,...
    if (!imageData?.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
    }

    const base64 = imageData.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64, 'base64')

    // Sanity check — reject if > 5MB
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 })
    }

    const id       = randomBytes(10).toString('hex')
    const filename = `${id}.png`
    const dir      = path.join(process.cwd(), 'public', 'uploads', 'shared')

    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, filename), buffer)

    return NextResponse.json({ id, url: `/uploads/shared/${filename}` })
  } catch (err) {
    console.error('Share image upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
