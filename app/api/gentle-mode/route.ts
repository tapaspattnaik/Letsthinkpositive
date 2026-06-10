import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// ── Gentle Mode detection ───────────────────────────────────────────────────
// When a user's recent mood logs show a sustained rough patch, the UI softens:
// streak pressure hides, calm tools surface first, copy gets gentler.
// Criteria: ≥3 mood logs in the last 7 days AND average mood ≤ 2.4 (of 5).

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ gentle: false })

  const userId = Number(session.user.id)
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)

  try {
    const moods = await prisma.moodEntry.findMany({
      where:   { userId, createdAt: { gte: sevenDaysAgo } },
      select:  { mood: true },
      orderBy: { createdAt: 'desc' },
    })

    if (moods.length < 3) return NextResponse.json({ gentle: false })

    const avg = moods.reduce((s, m) => s + m.mood, 0) / moods.length
    const gentle = avg <= 2.4

    return NextResponse.json({ gentle, moodAvg: Math.round(avg * 10) / 10, entries: moods.length })
  } catch {
    return NextResponse.json({ gentle: false })
  }
}
