import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createNotification } from '@/lib/notifications'

export async function POST(_: NextRequest, { params }: { params: { slug: string; postId: string } }) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to like.' }, { status: 401 })

  const userId = Number(session.user.id)
  const postId = Number(params.postId)

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId } },
  })

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } })
    const count = await prisma.postLike.count({ where: { postId } })
    return NextResponse.json({ liked: false, count })
  } else {
    await prisma.postLike.create({ data: { postId, userId } })
    const count = await prisma.postLike.count({ where: { postId } })

    // Notify post author (but not yourself)
    const post = await prisma.groupPost.findUnique({
      where:  { id: postId },
      select: { userId: true, circle: { select: { name: true, slug: true } } },
    })
    if (post?.userId && post.userId !== userId) {
      await createNotification(
        post.userId,
        'like',
        `${session.user.name ?? 'Someone'} liked your post in ${post.circle.name}`,
        `/circles/${post.circle.slug}`,
      )
    }

    return NextResponse.json({ liked: true, count })
  }
}
