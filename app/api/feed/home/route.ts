import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ community: [], circles: [] }, { status: 401 })

    const userId = Number(session.user.id)

    // Fetch joined circles
    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      include: { circle: { select: { id: true, slug: true, name: true, icon: true } } },
    })
    const circleIds = memberships.map(m => m.circleId)

    // Fetch recent community posts (approved)
    const communityPosts = await prisma.communityPost.findMany({
      where:   { approved: true },
      orderBy: { createdAt: 'desc' },
      take:    15,
      include: {
        user:   { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { likes: true } },
        likes:  { where: { userId }, select: { id: true } },
      },
    })

    // Fetch recent circle posts from all joined circles
    const circlePosts = circleIds.length > 0
      ? await prisma.groupPost.findMany({
          where:   { circleId: { in: circleIds } },
          orderBy: { createdAt: 'desc' },
          take:    20,
          include: {
            user:   { select: { id: true, name: true, avatarUrl: true } },
            circle: { select: { slug: true, name: true, icon: true } },
            _count: { select: { likes: true, comments: true } },
            likes:  { where: { userId }, select: { id: true } },
          },
        })
      : []

    return NextResponse.json({
      community: communityPosts.map(p => ({
        id:         p.id,
        type:       'community' as const,
        title:      p.title,
        body:       p.body,
        author:     p.author,
        user:       p.user,
        tags:       p.tags,
        likeCount:  p._count.likes,
        likedByMe:  (p.likes as {id:number}[]).length > 0,
        createdAt:  p.createdAt,
      })),
      circles: circlePosts.map(p => ({
        id:           p.id,
        type:         'circle' as const,
        body:         p.body,
        user:         p.user,
        circle:       p.circle,
        likeCount:    p._count.likes,
        commentCount: p._count.comments,
        likedByMe:    (p.likes as {id:number}[]).length > 0,
        createdAt:    p.createdAt,
      })),
    })
  } catch (err) {
    console.error('Home feed error:', err)
    return NextResponse.json({ community: [], circles: [] }, { status: 500 })
  }
}
