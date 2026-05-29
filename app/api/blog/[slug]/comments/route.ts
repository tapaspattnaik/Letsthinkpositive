import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const comments = await prisma.blogComment.findMany({
    where:   { slug, approved: true },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })
  return NextResponse.json(comments)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug }  = await params
  const session   = await getSession()
  const userId    = session?.user?.id ? Number(session.user.id) : null
  const { body, author } = await req.json()

  if (!body?.trim()) return NextResponse.json({ error: 'Comment required.' }, { status: 400 })

  const comment = await prisma.blogComment.create({
    data: {
      slug,
      userId,
      author:   userId ? (session!.user?.name ?? 'Member') : (author?.trim() || 'Anonymous'),
      body:     body.trim().slice(0, 800),
      approved: !!userId,   // logged-in → instant; guest → needs review
    },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })

  return NextResponse.json({ comment, live: !!userId })
}
