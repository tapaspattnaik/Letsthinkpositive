import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const session  = await getSession()

    if (!session?.user?.id)
      return NextResponse.json({ error: 'Sign in to join a circle.' }, { status: 401 })

    const circle = await prisma.circle.findUnique({ where: { slug } })
    if (!circle) return NextResponse.json({ error: 'Circle not found.' }, { status: 404 })

    const userId = Number(session.user.id)

    // Check if already a member
    const existing = await prisma.groupMember.findUnique({
      where: { circleId_userId: { circleId: circle.id, userId } },
    })

    if (existing) {
      return NextResponse.json({ ok: true, already: true })
    }

    await prisma.groupMember.create({
      data: { circleId: circle.id, userId },
    })

    return NextResponse.json({ ok: true, already: false })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Circle join error:', msg)
    return NextResponse.json({ error: 'Could not join circle. Please try again.' }, { status: 500 })
  }
}
