import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { CHALLENGE_NAMES } from '@/lib/memory'

// ── "Continue where you left off" ───────────────────────────────────────────
// Returns the single most relevant unfinished commitment, in priority order:
// 1. an active challenge with today's check-in still due
// 2. an at-risk streak (active streak, nothing logged today)

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ step: null })
  const userId = Number(session.user.id)

  const today = new Date().toISOString().slice(0, 10)

  try {
    // 1. Challenge check-in due
    const active = await prisma.challengeProgress.findMany({
      where:  { userId, completedAt: null },
      select: { challengeSlug: true, completedDays: true },
    })
    for (const c of active) {
      let days: string[] = []
      try { days = JSON.parse(c.completedDays || '[]') } catch { /* noop */ }
      if (!days.includes(today)) {
        const name = CHALLENGE_NAMES[c.challengeSlug] ?? c.challengeSlug
        return NextResponse.json({
          step: {
            icon:    '🏆',
            title:   `Day ${days.length + 1} of ${name} is waiting`,
            message: 'One small check-in keeps the chain unbroken.',
            cta:     'Check in now',
            href:    '/challenges',
          },
        })
      }
    }

    // 2. Streak at risk today
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { currentStreak: true, lastActiveDate: true },
    })
    if (user && user.currentStreak > 0) {
      const last = user.lastActiveDate ? new Date(user.lastActiveDate).toISOString().slice(0, 10) : null
      if (last !== today) {
        return NextResponse.json({
          step: {
            icon:    '🔥',
            title:   `Your ${user.currentStreak}-day streak needs you today`,
            message: 'A 10-second mood check-in keeps it alive.',
            cta:     'Quick check-in',
            href:    '/mood',
          },
        })
      }
    }

    return NextResponse.json({ step: null })
  } catch {
    return NextResponse.json({ step: null })
  }
}
