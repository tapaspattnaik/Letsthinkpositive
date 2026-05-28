import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET — Weekly Wellness Snapshot for the logged-in user (past 7 days)
export async function GET() {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userId = Number(session.user.id)

  // ── Build 7-day date range (today and 6 days before) ──────────────────────
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }

  const weekStart = days[0]
  const weekEnd   = days[6]

  // ── Week label (e.g. "May 19 – 25, 2025") ────────────────────────────────
  const fmt = (dateStr: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', opts)

  const startLabel = fmt(weekStart, { month: 'long', day: 'numeric' })
  const endLabel   = fmt(weekEnd,   { day: 'numeric', year: 'numeric' })
  const week       = `${startLabel} – ${endLabel}`

  // ── Mood data ─────────────────────────────────────────────────────────────
  const moodRows = await prisma.moodEntry.findMany({
    where:   { userId, date: { gte: weekStart, lte: weekEnd } },
    select:  { date: true, mood: true },
    orderBy: { date: 'asc' },
  })

  const moodMap = Object.fromEntries(moodRows.map(r => [r.date, r.mood]))

  const moodEntries = days.map(date => ({
    date,
    mood: moodMap[date] ?? null,
  }))

  const moodsWithValues = moodEntries.filter(e => e.mood !== null) as { date: string; mood: number }[]

  const moodAverage: number | null =
    moodsWithValues.length > 0
      ? Math.round((moodsWithValues.reduce((s, e) => s + e.mood, 0) / moodsWithValues.length) * 10) / 10
      : null

  // Trend: compare first half vs second half of the week
  let moodTrend: 'up' | 'down' | 'stable' | 'insufficient' = 'insufficient'
  if (moodsWithValues.length >= 4) {
    const mid   = Math.floor(moodsWithValues.length / 2)
    const first = moodsWithValues.slice(0, mid).reduce((s, e) => s + e.mood, 0) / mid
    const last  = moodsWithValues.slice(mid).reduce((s, e) => s + e.mood, 0) / (moodsWithValues.length - mid)
    if (last - first > 0.4)       moodTrend = 'up'
    else if (first - last > 0.4)  moodTrend = 'down'
    else                          moodTrend = 'stable'
  }

  // Best day
  let bestDay: string | null  = null
  let bestMood: number | null = null
  if (moodsWithValues.length > 0) {
    const best = moodsWithValues.reduce((a, b) => b.mood > a.mood ? b : a)
    bestMood = best.mood
    bestDay  = new Date(best.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })
  }

  // ── Habit data ────────────────────────────────────────────────────────────
  const habits = await prisma.habit.findMany({
    where:   { userId, active: true },
    select:  { id: true, name: true },
  })

  const totalHabits = habits.length

  let completedToday   = 0
  let weeklyRate       = 0
  let topHabit: string | null = null

  if (totalHabits > 0) {
    const today = new Date().toISOString().split('T')[0]

    const logs = await prisma.habitLog.findMany({
      where: {
        userId,
        date: { gte: weekStart, lte: weekEnd },
      },
      select: { habitId: true, date: true },
    })

    // Completed today
    completedToday = logs.filter(l => l.date === today).length

    // Weekly rate: (unique habit-day completions) / (total habits × 7) × 100
    const totalPossible = totalHabits * 7
    weeklyRate = totalPossible > 0
      ? Math.round((logs.length / totalPossible) * 100)
      : 0

    // Top habit: most logs in the week
    const countByHabit: Record<number, number> = {}
    for (const log of logs) {
      countByHabit[log.habitId] = (countByHabit[log.habitId] ?? 0) + 1
    }
    const topId = Object.entries(countByHabit).sort((a, b) => b[1] - a[1])[0]?.[0]
    if (topId) {
      topHabit = habits.find(h => h.id === Number(topId))?.name ?? null
    }
  }

  // ── Streak ────────────────────────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { currentStreak: true, longestStreak: true },
  })

  const streak = {
    current: user?.currentStreak ?? 0,
    longest: user?.longestStreak ?? 0,
  }

  // ── Encouraging message ───────────────────────────────────────────────────
  let message: string

  if (moodAverage === null) {
    message = "Your journey starts whenever you're ready. Check in tomorrow."
  } else if (moodAverage >= 4) {
    message = "You had a luminous week — your mood was high and your habits stayed strong."
  } else if (moodAverage >= 3) {
    message = "A steady, grounded week. You showed up consistently and that matters."
  } else {
    message = "Even in harder weeks, you kept going. That takes real courage."
  }

  if (weeklyRate > 70)  message += " Your habits are building real momentum."
  if (streak.current > 7) message += " And that streak? It's becoming part of who you are."

  // ── Response ──────────────────────────────────────────────────────────────
  return NextResponse.json({
    week,
    mood: {
      entries:  moodEntries,
      average:  moodAverage,
      trend:    moodTrend,
      bestDay,
      bestMood,
    },
    habits: {
      total:          totalHabits,
      completedToday,
      weeklyRate,
      topHabit,
    },
    streak,
    message,
  })
}
