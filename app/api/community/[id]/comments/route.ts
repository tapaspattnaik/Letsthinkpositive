import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET — comments for a community post
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const comments = await prisma.communityComment.findMany({
      where:   { postId: Number(id) },
      orderBy: { createdAt: 'asc' },
      take:    100,
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    })
    return NextResponse.json(comments)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

// POST — add a comment (signed-in only)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Sign in to reply.' }, { status: 401 })

  const { body } = await req.json().catch(() => ({}))
  if (!body?.trim()) return NextResponse.json({ error: 'Reply text required.' }, { status: 400 })

  const post = await prisma.communityPost.findUnique({
    where:  { id: Number(id) },
    select: { id: true, userId: true, title: true },
  })
  if (!post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 })

  const userId = Number(session.user.id)
  const comment = await prisma.communityComment.create({
    data:    { postId: post.id, userId, body: body.trim().slice(0, 600) },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })

  // Notify the post author (not for self-replies)
  if (post.userId && post.userId !== userId) {
    prisma.notification.create({
      data: {
        userId:  post.userId,
        type:    'comment',
        message: `💬 ${session.user.name ?? 'Someone'} replied to your post "${post.title.slice(0, 60)}"`,
        link:    '/community',
      },
    }).catch(() => {})
  }

  return NextResponse.json(comment)
}
