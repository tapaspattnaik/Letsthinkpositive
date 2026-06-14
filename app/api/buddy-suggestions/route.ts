import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// ── Buddy Suggestions v1 ─────────────────────────────────────────────────────
// Match the current user against others who share:
//   1. an active challenge (same slug)
//   2. overlapping interests (comma-separated)
// Returns up to 5 suggestions with match reason.

interface Suggestion {
  id: number
  name: string
  avatarUrl: string | null
  interests: string
  currentStreak: number
  badges: number
  matchReason: string
  matchScore: number
}

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ suggestions: [] })

  const userId = Number(session.user.id)

  try {
    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        interests: true,
        progress:  { where: { completedAt: null }, select: { challengeSlug: true } },
      },
    })
    if (!me) return NextResponse.json({ suggestions: [] })

    const myInterests    = me.interests.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    const myChallenges   = me.progress.map(p => p.challengeSlug)

    // Find users who share at least one active challenge
    const challengeMatches = myChallenges.length
      ? await prisma.challengeProgress.findMany({
          where: {
            challengeSlug: { in: myChallenges },
            completedAt:   null,
            userId:        { not: userId },
          },
          select: {
            challengeSlug: true,
            user: {
              select: {
                id: true, name: true, avatarUrl: true, interests: true, currentStreak: true,
                blocked: true,
                _count: { select: { badges: true } },
              },
            },
          },
          take: 40,
        })
      : []

    // Build scored map
    const map = new Map<number, Suggestion>()

    for (const cp of challengeMatches) {
      const u = cp.user
      if (u.blocked) continue
      const existing = map.get(u.id)
      const reason   = `Both doing the ${cp.challengeSlug.replace(/-/g, ' ')} challenge`
      if (!existing) {
        map.set(u.id, {
          id: u.id, name: u.name, avatarUrl: u.avatarUrl,
          interests: u.interests, currentStreak: u.currentStreak,
          badges: u._count.badges, matchReason: reason, matchScore: 10,
        })
      } else {
        existing.matchScore += 5
      }
    }

    // Add interest-based matches
    if (myInterests.length) {
      const interestUsers = await prisma.user.findMany({
        where: {
          id:      { not: userId },
          blocked: false,
          AND: myInterests.slice(0, 3).map(i => ({ interests: { contains: i } })),
        },
        select: {
          id: true, name: true, avatarUrl: true, interests: true, currentStreak: true,
          _count: { select: { badges: true } },
        },
        take: 20,
      })

      for (const u of interestUsers) {
        const theirInterests = u.interests.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
        const shared = myInterests.filter(i => theirInterests.includes(i))
        if (!shared.length) continue
        const existing = map.get(u.id)
        if (!existing) {
          map.set(u.id, {
            id: u.id, name: u.name, avatarUrl: u.avatarUrl,
            interests: u.interests, currentStreak: u.currentStreak,
            badges: u._count.badges,
            matchReason: `Shared interests: ${shared.slice(0, 2).join(', ')}`,
            matchScore: shared.length * 3,
          })
        } else {
          existing.matchScore  += shared.length * 3
          existing.matchReason += ` · shared interests`
        }
      }
    }

    const sorted = [...map.values()]
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)

    return NextResponse.json({ suggestions: sorted })
  } catch {
    return NextResponse.json({ suggestions: [] })
  }
}
