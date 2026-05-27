import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createNotification } from '@/lib/notifications'

export async function POST(req: NextRequest, { params }: { params: { slug: string; postId: string } }) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to comment.' }, { status: 401 })

  const userId = Number(session.user.id)
  const postId = Number(params.postId)
  const { body } = await req.json()

  if (!body?.trim()) return NextResponse.json({ error: 'Comment required.' }, { status: 400 })

  const post = await prisma.groupPost.findUnique({
    where:  { id: postId },
    select: { userId: true, circle: { select: { name: true, slug: true } } },
  })
  if (!post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 })

  const comment = await prisma.postComment.create({
    data:    { postId, userId, body: body.trim().slice(0, 500) },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })

  // Notify post author (but not yourself)
  if (post.userId && post.userId !== userId) {
    await createNotification(
      post.userId,
      'comment',
      `${session.user.name ?? 'Someone'} commented on your post in ${post.circle.name}`,
      `/circles/${post.circle.slug}`,
    )
  }

  return NextResponse.json(comment)
}
