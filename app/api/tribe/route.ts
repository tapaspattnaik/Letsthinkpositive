import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

    const userId = Number(session.user.id)

    const [followingRows, followerRows, me] = await Promise.all([
      // People I follow
      prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true, name: true, avatarUrl: true, bio: true, interests: true,
              currentStreak: true,
              _count: { select: { badges: true, followers: true, posts: true } },
            },
          },
        },
      }),
      // People who follow me
      prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true, name: true, avatarUrl: true, bio: true, interests: true,
              currentStreak: true,
              _count: { select: { badges: true, followers: true, posts: true } },
            },
          },
        },
      }),
      // My own interests for suggestions
      prisma.user.findUnique({
        where: { id: userId },
        select: { interests: true },
      }),
    ])

    const followingIds = new Set(followingRows.map(r => r.followingId))
    followingIds.add(userId) // exclude self

    // Discover: users with shared interests not already followed
    const myInterests = me?.interests?.split(',').filter(Boolean) ?? []
    const suggestions = myInterests.length > 0
      ? await prisma.user.findMany({
          where: {
            id:        { notIn: [...followingIds] },
            interests: { contains: myInterests[0] }, // shared interest match
          },
          select: {
            id: true, name: true, avatarUrl: true, bio: true, interests: true,
            currentStreak: true,
            _count: { select: { badges: true, followers: true } },
          },
          take: 8,
          orderBy: { currentStreak: 'desc' },
        })
      : await prisma.user.findMany({
          where: { id: { notIn: [...followingIds] } },
          select: {
            id: true, name: true, avatarUrl: true, bio: true, interests: true,
            currentStreak: true,
            _count: { select: { badges: true, followers: true } },
          },
          take: 8,
          orderBy: { createdAt: 'desc' },
        })

    // Tribe feed: recent posts from people I follow
    const feed = followingIds.size > 1
      ? await prisma.communityPost.findMany({
          where: {
            approved: true,
            userId:   { in: [...followingIds].filter(id => id !== userId) },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user:   { select: { id: true, name: true, avatarUrl: true } },
            _count: { select: { likes: true } },
          },
        })
      : []

    return NextResponse.json({
      following:   followingRows.map(r => r.following),
      followers:   followerRows.map(r => r.follower),
      suggestions: suggestions.filter(u => u.id !== userId),
      feed:        feed.map(p => ({
        id: p.id, title: p.title, body: p.body, createdAt: p.createdAt,
        user: p.user, likes: p._count.likes, tags: p.tags,
      })),
    })
  } catch (err) {
    console.error('Tribe API error:', err)
    return NextResponse.json({ following: [], followers: [], suggestions: [], feed: [] })
  }
}
