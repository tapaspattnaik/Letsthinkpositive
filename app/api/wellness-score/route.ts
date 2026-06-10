import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// ── Personal Wellness Index (PWI) ──────────────────────────────────────────
// 4 equal components, each 0–25 points:
//   Mood      — (avg mood / 5) × 25
//   Sleep     — (avg sleep hrs / 8) × 25  (capped at 8 h)
//   Streak    — min(streak / 21, 1) × 25  (21-day streak = full points)
//   Habits    — habitRate × 25

function scoreLabel(score: number): { label: string; colour: string } {
  if (score >= 80) return { label: 'Thriving',   colour: '#2D9B8A' }
  if (score >= 65) return { label: 'Flourishing', colour: '#4CAF7D' }
  if (score >= 50) return { label: 'Growing',     colour: '#E8A020' }
  if (score >= 35) return { label: 'Recovering',  colour: '#E87A20' }
  return              { label: 'Starting out',   colour: '#6B8F8F' }
}

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const userId = Number(session.user.id)
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)

  const [user, moods, sleepLogs, habitLogs, activeHabits] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: userId },
      select: { currentStreak: true },
    }),
    prisma.moodEntry.findMany({
      where:  { userId, createdAt: { gte: sevenDaysAgo } },
      select: { mood: true },
    }),
    prisma.sleepLog.findMany({
      where:  { userId, createdAt: { gte: sevenDaysAgo } },
      select: { durationMins: true },
    }),
    prisma.habitLog.findMany({
      where:  { userId, createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.habit.findMany({
      where:  { userId, active: true },
      select: { id: true },
    }),
  ])

  // ── Component calculations ─────────────────────────────────────────────────
  const moodAvg = moods.length
    ? moods.reduce((s: number, m) => s + m.mood, 0) / moods.length
    : null
  const sleepAvg = sleepLogs.length
    ? sleepLogs.reduce((s: number, l) => s + l.durationMins, 0) / sleepLogs.length / 60
    : null
  const streak    = user?.currentStreak ?? 0
  const habitRate = activeHabits.length > 0
    ? Math.min(1, habitLogs.length / (activeHabits.length * 7))
    : null

  const moodScore   = moodAvg  !== null ? (moodAvg / 5) * 25                       : 0
  const sleepScore  = sleepAvg !== null ? Math.min(sleepAvg / 8, 1) * 25           : 0
  const streakScore = Math.min(streak / 21, 1) * 25
  const habitScore  = habitRate !== null ? habitRate * 25                           : 0

  // Count how many components have real data
  const dataPoints = [moodAvg, sleepAvg, streak > 0 || true, habitRate].filter(Boolean).length

  // If very few data points, scale score to reflect actual contribution
  const hasData = moods.length > 0 || sleepLogs.length > 0 || streak > 0

  // Raw total (could be lower if missing components)
  const rawTotal = moodScore + sleepScore + streakScore + habitScore

  // If some components are missing data (0 by default), scale to what we have
  // e.g. if only mood and streak have data, max possible = 50, so scale to 100
  const maxPossible =
    (moodAvg   !== null ? 25 : 0) +
    (sleepAvg  !== null ? 25 : 0) +
    (streak > 0 ? 25 : streakScore > 0 ? 25 : 0) + // streak=0 is valid data
    (habitRate !== null ? 25 : 0)

  // Always include streak component (0 is valid — user just hasn't started)
  const effectiveMax = Math.max(
    (moodAvg  !== null ? 25 : 0) +
    (sleepAvg !== null ? 25 : 0) +
    25 + // streak always counted
    (habitRate !== null ? 25 : 0),
    25  // minimum denominator
  )

  const pwi = effectiveMax > 0 ? Math.round((rawTotal / effectiveMax) * 100) : 0
  const { label, colour } = scoreLabel(pwi)

  return NextResponse.json({
    pwi,
    label,
    colour,
    hasData,
    components: {
      mood:   { score: Math.round(moodScore),   max: 25, value: moodAvg   ? Math.round(moodAvg * 10) / 10 : null },
      sleep:  { score: Math.round(sleepScore),  max: 25, value: sleepAvg  ? Math.round(sleepAvg * 10) / 10 : null },
      streak: { score: Math.round(streakScore), max: 25, value: streak },
      habits: { score: Math.round(habitScore),  max: 25, value: habitRate !== null ? Math.round(habitRate * 100) : null },
    },
  })
}
