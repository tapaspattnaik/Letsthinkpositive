import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session  = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Sign in to leave a circle.' }, { status: 401 })

  const circle = await prisma.circle.findUnique({ where: { slug } })
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 })

  const userId = Number(session.user.id)

  await prisma.groupMember.deleteMany({
    where: { circleId: circle.id, userId },
  })

  return NextResponse.json({ ok: true })
}
