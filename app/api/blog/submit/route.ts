import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { moderateContent } from '@/lib/contentModeration'
import path from 'path'
import fs from 'fs/promises'
import crypto from 'crypto'

// Max file sizes
const MAX_DOC_SIZE = 5 * 1024 * 1024  // 5 MB
const MAX_IMG_SIZE = 4 * 1024 * 1024  // 4 MB
const UPLOAD_DIR   = path.join(process.cwd(), 'public', 'uploads', 'blog')

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80) + '-' + Date.now()
}

async function parseDocx(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid SSR issues
  const mammoth = await import('mammoth')
  const result  = await mammoth.convertToHtml({ buffer })
  return result.value
}

async function parsePdf(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
  const data     = await pdfParse(buffer)
  // Convert plain text to simple paragraphs
  return data.text
    .split(/\n{2,}/)
    .map((p: string) => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
    .filter((p: string) => p !== '<p></p>')
    .join('\n')
}

async function parseTxt(buffer: Buffer): Promise<string> {
  const text = buffer.toString('utf-8')
  return text
    .split(/\n{2,}/)
    .map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
    .filter(p => p !== '<p></p>')
    .join('\n')
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to submit a blog post.' }, { status: 401 })
  }
  const userId = Number(session.user.id)

  try {
    const formData = await req.formData()

    const title       = (formData.get('title')       as string)?.trim()
    const excerpt     = (formData.get('excerpt')      as string)?.trim()
    const category    = (formData.get('category')     as string)?.trim()
    const subCategory = (formData.get('subCategory')  as string)?.trim() || null
    const docFile     = formData.get('document')      as File | null
    const bodyText    = (formData.get('bodyText')     as string)?.trim()

    if (!title)    return NextResponse.json({ error: 'Title is required.' },    { status: 400 })
    if (!category) return NextResponse.json({ error: 'Category is required.' }, { status: 400 })

    // ── Parse body from file or text ──────────────────────────
    let body = ''

    if (docFile && docFile.size > 0) {
      if (docFile.size > MAX_DOC_SIZE) {
        return NextResponse.json({ error: 'Document must be under 5 MB.' }, { status: 400 })
      }
      const buf  = Buffer.from(await docFile.arrayBuffer())
      const name = docFile.name.toLowerCase()

      if (name.endsWith('.docx')) {
        body = await parseDocx(buf)
      } else if (name.endsWith('.pdf')) {
        body = await parsePdf(buf)
      } else if (name.endsWith('.txt') || name.endsWith('.md')) {
        body = await parseTxt(buf)
      } else {
        return NextResponse.json({ error: 'Unsupported file type. Use .docx, .pdf, or .txt' }, { status: 400 })
      }
    } else if (bodyText) {
      body = bodyText
        .split(/\n{2,}/)
        .map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
        .join('\n')
    } else {
      return NextResponse.json({ error: 'Please upload a file or paste your content.' }, { status: 400 })
    }

    // ── AI content moderation ────────────────────────────────
    const modResult = await moderateContent(title, body)
    if (!modResult.safe) {
      return NextResponse.json({
        flagged: true,
        issues:  modResult.issues,
        message: modResult.message || 'Your post was flagged for review. Please revise before resubmitting.',
      }, { status: 422 })
    }

    // ── Save images ───────────────────────────────────────────
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
    const imageUrls: string[] = []

    const imgEntries = Array.from(formData.entries()).filter(([k]) => k.startsWith('image_'))
    for (const [, file] of imgEntries) {
      if (!(file instanceof File) || file.size === 0) continue
      if (file.size > MAX_IMG_SIZE) continue

      const ext    = path.extname(file.name).toLowerCase() || '.jpg'
      const fname  = `${crypto.randomUUID()}${ext}`
      const fpath  = path.join(UPLOAD_DIR, fname)
      await fs.writeFile(fpath, Buffer.from(await file.arrayBuffer()))
      imageUrls.push(`/uploads/blog/${fname}`)
    }

    // ── Create record ─────────────────────────────────────────
    const post = await prisma.userBlogPost.create({
      data: {
        userId,
        title,
        slug:        slugify(title),
        excerpt:     excerpt || body.replace(/<[^>]+>/g, '').slice(0, 200) + '…',
        body,
        category,
        subCategory,
        images:      JSON.stringify(imageUrls),
        status:      'pending',
      },
    })

    return NextResponse.json({ id: post.id, message: 'Submitted for review! We\'ll publish it soon.' })
  } catch (err) {
    console.error('Blog submit error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
