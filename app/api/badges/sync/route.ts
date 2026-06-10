/**
 * GET /api/badges/sync
 *
 * Retroactively awards any badges the user should have earned but didn't
 * (e.g. due to the badges table being empty when they completed a challenge).
 *
 * Safe to call multiple times — uses upsert / findOrCreate patterns.
 */

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { BADGE_BY_CHALLENGE, BADGES } from '@/lib/badges'

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const userId = Number(session.user.id)

  // ── 1. Upsert ALL badge definitions so the badges table is never empty ────
  for (const def of BADGES) {
    await prisma.badge.upsert({
      where: { slug: def.slug },
      create: {
        slug:        def.slug,
        name:        def.name,
        description: def.description,
        icon:        def.icon,
        tier:        def.tier,
        challenge:   def.challenge ?? null,
      },
      update: {}, // preserve any manual edits
    })
  }

  // ── 2. Find all completed challenge progresses for this user ──────────────
  const completed = await prisma.challengeProgress.findMany({
    where: { userId, completedAt: { not: null } },
    select: { challengeSlug: true },
  })

  const awarded: string[] = []

  for (const { challengeSlug } of completed) {
    const badgeDef = BADGE_BY_CHALLENGE[challengeSlug]
    if (!badgeDef) continue

    const badge = await prisma.badge.findUnique({ where: { slug: badgeDef.slug } })
    if (!badge) continue

    const alreadyHas = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    })
    if (!alreadyHas) {
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } })
      awarded.push(badgeDef.name)
    }
  }

  return NextResponse.json({
    ok: true,
    awardedNow: awarded,
    message: awarded.length > 0
      ? `Retroactively awarded: ${awarded.join(', ')}`
      : 'All badges already up to date.',
  })
}
