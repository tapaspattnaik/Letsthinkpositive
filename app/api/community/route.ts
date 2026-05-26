import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { title, body, author, tags } = await req.json()
    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
    }
    await prisma.communityPost.create({
      data: {
        title:    title.trim().slice(0, 200),
        body:     body.trim().slice(0, 2000),
        author:   (author?.trim() || 'Anonymous').slice(0, 100),
        tags:     (tags?.trim() || '').slice(0, 500),
        approved: false,
      },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Community post error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const posts = await prisma.communityPost.findMany({
      where:   { approved: true },
      orderBy: { createdAt: 'desc' },
      take:    20,
    })
    return NextResponse.json(posts)
  } catch (err) {
    console.error('Community fetch error:', err)
    return NextResponse.json({ error: 'Could not load posts' }, { status: 500 })
  }
}
