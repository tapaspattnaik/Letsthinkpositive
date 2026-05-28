import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createNotification } from '@/lib/notifications'

// POST — toggle follow/unfollow
export async function POST(_: NextRequest, { params }: { params: { userId: string } }) {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Sign in to follow.' }, { status: 401 })

  const followerId  = Number(session.user.id)
  const followingId = Number(params.userId)

  if (followerId === followingId)
    return NextResponse.json({ error: 'Cannot follow yourself.' }, { status: 400 })

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  })

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } })
    const count = await prisma.follow.count({ where: { followingId } })
    return NextResponse.json({ following: false, followerCount: count })
  }

  await prisma.follow.create({ data: { followerId, followingId } })
  const count = await prisma.follow.count({ where: { followingId } })

  // Notify the followed user
  await createNotification(
    followingId,
    'follow',
    `${session.user.name ?? 'Someone'} started following you`,
    `/profile/${followerId}`,
  )

  return NextResponse.json({ following: true, followerCount: count })
}

// GET — check follow status + counts for a user
export async function GET(_: NextRequest, { params }: { params: { userId: string } }) {
  const session     = await getSession()
  const targetId    = Number(params.userId)
  const viewerId    = session?.user?.id ? Number(session.user.id) : null

  const [followerCount, followingCount, isFollowing] = await Promise.all([
    prisma.follow.count({ where: { followingId: targetId } }),
    prisma.follow.count({ where: { followerId: targetId } }),
    viewerId && viewerId !== targetId
      ? prisma.follow.findUnique({ where: { followerId_followingId: { followerId: viewerId, followingId: targetId } } })
      : null,
  ])

  return NextResponse.json({
    followerCount,
    followingCount,
    isFollowing: !!isFollowing,
  })
}
