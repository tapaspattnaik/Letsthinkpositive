import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/db'
import { getSession }   from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ users: [], circles: [] })
  const myId = Number(session.user.id)

  const me = await prisma.user.findUnique({
    where:  { id: myId },
    select: { primaryGoal: true, interests: true },
  })

  const myInterests = (me?.interests ?? '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  const myGoal      = me?.primaryGoal ?? ''

  // Users I already follow
  const following = await prisma.follow.findMany({
    where:  { followerId: myId },
    select: { followingId: true },
  })
  const followingIds = new Set([myId, ...following.map(f => f.followingId)])

  // Find candidates with same goal OR overlapping interests
  const candidates = await prisma.user.findMany({
    where: {
      id:      { notIn: Array.from(followingIds) },
      blocked: false,
      OR: [
        myGoal ? { primaryGoal: myGoal } : {},
        ...myInterests.slice(0, 3).map(kw => ({ interests: { contains: kw } })),
      ].filter(o => Object.keys(o).length > 0),
    },
    select: {
      id: true, name: true, avatarUrl: true, bio: true,
      primaryGoal: true, interests: true,
      _count: { select: { badges: true, followers: true } },
    },
    take: 20,
  })

  // Score by overlap
  const scored = candidates.map(u => {
    const theirInterests = u.interests.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    const shared = myInterests.filter(i => theirInterests.includes(i)).length
    const goalMatch = myGoal && u.primaryGoal === myGoal ? 2 : 0
    return { ...u, score: shared + goalMatch, sharedInterests: myInterests.filter(i => theirInterests.includes(i)) }
  }).sort((a, b) => b.score - a.score).slice(0, 3)

  // Circles matching interests or goal
  const circles = await prisma.circle.findMany({
    where: {
      members: { none: { userId: myId } },
      OR: [
        ...myInterests.slice(0, 2).map(kw => ({ name: { contains: kw } })),
        ...myInterests.slice(0, 2).map(kw => ({ description: { contains: kw } })),
      ],
    },
    include: { _count: { select: { members: true } } },
    take: 2,
  })

  return NextResponse.json({
    users: scored.map(u => ({
      id:              u.id,
      name:            u.name,
      avatar:          u.avatarUrl,
      bio:             u.bio,
      badges:          u._count.badges,
      followers:       u._count.followers,
      sharedInterests: u.sharedInterests.slice(0, 2),
      sameGoal:        myGoal ? u.primaryGoal === myGoal : false,
    })),
    circles: circles.map(c => ({
      id:          c.id,
      name:        c.name,
      slug:        c.slug,
      icon:        c.icon,
      description: c.description,
      members:     c._count.members,
    })),
  })
}
