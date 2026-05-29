import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createNotification } from '@/lib/notifications'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Sign in to like.' }, { status: 401 })

  const userId = Number(session.user.id)
  const postId = Number(id)

  const existing = await prisma.communityLike.findUnique({
    where: { postId_userId: { postId, userId } },
  })

  if (existing) {
    await prisma.communityLike.delete({ where: { id: existing.id } })
    const count = await prisma.communityLike.count({ where: { postId } })
    return NextResponse.json({ liked: false, count })
  }

  await prisma.communityLike.create({ data: { postId, userId } })
  const count = await prisma.communityLike.count({ where: { postId } })

  // Notify post author
  const post = await prisma.communityPost.findUnique({
    where:  { id: postId },
    select: { userId: true, title: true },
  })
  if (post?.userId && post.userId !== userId) {
    await createNotification(
      post.userId,
      'like',
      `${session.user.name ?? 'Someone'} liked your post "${post.title.slice(0, 50)}"`,
      '/community',
    )
  }

  return NextResponse.json({ liked: true, count })
}
