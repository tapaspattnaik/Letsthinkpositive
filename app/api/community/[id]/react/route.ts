import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createNotification } from '@/lib/notifications'

const VALID_EMOJIS = ['🙏', '❤️', '💪', '✨', '😊']

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Sign in to react.' }, { status: 401 })

  const userId = Number(session.user.id)
  const postId = Number(id)
  const { emoji } = await req.json()

  if (!VALID_EMOJIS.includes(emoji))
    return NextResponse.json({ error: 'Invalid emoji.' }, { status: 400 })

  const existing = await prisma.communityReaction.findUnique({
    where: { postId_userId_emoji: { postId, userId, emoji } },
  })

  if (existing) {
    await prisma.communityReaction.delete({ where: { id: existing.id } })
  } else {
    await prisma.communityReaction.create({ data: { postId, userId, emoji } })

    // Notify post author
    const post = await prisma.communityPost.findUnique({
      where:  { id: postId },
      select: { userId: true, title: true },
    })
    if (post?.userId && post.userId !== userId) {
      await createNotification(
        post.userId,
        'like',
        `${session.user.name ?? 'Someone'} reacted ${emoji} to your wish "${post.title.slice(0, 50)}"`,
        '/community',
      )
    }
  }

  // Return updated reaction counts for this post
  const reactions = await prisma.communityReaction.groupBy({
    by:     ['emoji'],
    where:  { postId },
    _count: { emoji: true },
  })

  const myReactions = await prisma.communityReaction.findMany({
    where:  { postId, userId },
    select: { emoji: true },
  })

  return NextResponse.json({
    counts:      Object.fromEntries(reactions.map(r => [r.emoji, r._count.emoji])),
    myReactions: myReactions.map(r => r.emoji),
  })
}
