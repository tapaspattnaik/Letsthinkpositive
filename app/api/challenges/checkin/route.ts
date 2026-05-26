import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { BADGE_BY_CHALLENGE } from '@/lib/badges'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Sign in to check in.' }, { status: 401 })

  const { slug, totalDays } = await req.json()
  const userId = Number(session.user.id)
  const today  = new Date().toISOString().slice(0, 10)

  const row = await prisma.challengeProgress.findUnique({
    where: { userId_challengeSlug: { userId, challengeSlug: slug } },
  })
  if (!row) return NextResponse.json({ error: 'Not enrolled' }, { status: 400 })
  if (row.completedAt) return NextResponse.json({ alreadyDone: true, badge: null })

  const days: string[] = JSON.parse(row.completedDays || '[]')
  if (days.includes(today)) return NextResponse.json({ alreadyCheckedIn: true, days })

  days.push(today)
  const isComplete = days.length >= (totalDays ?? 999)

  const updated = await prisma.challengeProgress.update({
    where: { userId_challengeSlug: { userId, challengeSlug: slug } },
    data: {
      completedDays: JSON.stringify(days),
      completedAt:   isComplete ? new Date() : null,
    },
  })

  // Award badge on completion
  let awardedBadge = null
  if (isComplete) {
    const badgeDef = BADGE_BY_CHALLENGE[slug]
    if (badgeDef) {
      const badge = await prisma.badge.findUnique({ where: { slug: badgeDef.slug } })
      if (badge) {
        const alreadyHas = await prisma.userBadge.findUnique({
          where: { userId_badgeId: { userId, badgeId: badge.id } },
        })
        if (!alreadyHas) {
          await prisma.userBadge.create({ data: { userId, badgeId: badge.id } })
          awardedBadge = badgeDef
        }
      }
    }

    // Check for "first-post" (story sharer) badge via post count — skip here, handled in community API
  }

  return NextResponse.json({ ok: true, days, isComplete, awardedBadge })
}
