import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Sign in to join a challenge.' }, { status: 401 })

  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  const existing = await prisma.challengeProgress.findUnique({
    where: { userId_challengeSlug: { userId: Number(session.user.id), challengeSlug: slug } },
  })
  if (existing) return NextResponse.json({ already: true })

  await prisma.challengeProgress.create({
    data: { userId: Number(session.user.id), challengeSlug: slug, completedDays: '[]' },
  })

  return NextResponse.json({ ok: true })
}
