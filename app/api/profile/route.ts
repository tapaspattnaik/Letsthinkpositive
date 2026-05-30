import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    include: {
      badges:   { include: { badge: true }, orderBy: { earnedAt: 'desc' } },
      progress: { orderBy: { startedAt: 'desc' } },
    },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { password: _, ...safe } = user
  return NextResponse.json(safe)
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { name, phone, bio, interests, coverStyle, coverUrl } = await req.json()

  const updated = await prisma.user.update({
    where: { id: Number(session.user.id) },
    data: {
      name:       name       || undefined,
      phone:      phone      ?? undefined,
      bio:        bio        ?? undefined,
      interests:  Array.isArray(interests) ? interests.join(',') : (interests ?? undefined),
      coverStyle: coverStyle ?? undefined,
      coverUrl:   coverUrl   ?? undefined,
    },
  })

  const { password: _, ...safe } = updated
  return NextResponse.json(safe)
}
