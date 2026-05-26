import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  const userId  = session?.user?.id ? Number(session.user.id) : null

  const circles = await prisma.circle.findMany({
    orderBy: { id: 'asc' },
    include: {
      _count:  { select: { members: true, posts: true } },
      members: userId ? { where: { userId }, select: { id: true } } : false,
    },
  })

  return NextResponse.json(circles.map(c => ({
    ...c,
    memberCount: c._count.members,
    postCount:   c._count.posts,
    isMember:    userId ? c.members.length > 0 : false,
    members:     undefined,
    _count:      undefined,
  })))
}
