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

  const [user, moods, sleepLogs, habitLogs, activeHabits, allMoods, allSleep, allGratitudeDates] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: userId },
      select: { currentStreak: true, longestStreak: true },
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
    // Full history — small per-user datasets, used for personal-best framing
    prisma.moodEntry.findMany({
      where:  { userId },
      select: { mood: true, date: true },
    }),
    prisma.sleepLog.findMany({
      where:  { userId },
      select: { durationMins: true, date: true },
    }),
    prisma.gratitudeEntry.findMany({
      where:  { userId },
      select: { date: true },
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

  // ── Personal bests — always self-comparison, never against others ──────────
  // ISO-week key from a YYYY-MM-DD date string
  function weekKey(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00Z')
    const day = (d.getUTCDay() + 6) % 7            // Mon=0
    d.setUTCDate(d.getUTCDate() - day + 3)         // nearest Thursday
    const jan4 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
    const week = 1 + Math.round(((d.getTime() - jan4.getTime()) / 86400000 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7)
    return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
  }

  const personalBests: string[] = []
  const nowWeek  = weekKey(new Date().toISOString().split('T')[0])
  const nowMonth = new Date().toISOString().slice(0, 7)

  // 🔥 Streak record
  const longest = user?.longestStreak ?? 0
  if (streak >= 3 && streak === longest) {
    personalBests.push(`🔥 ${streak} days — your longest streak ever`)
  } else if (streak >= 3 && longest - streak <= 3) {
    personalBests.push(`🔥 ${longest - streak} day${longest - streak === 1 ? '' : 's'} from your all-time streak record`)
  }

  // 🌙 Best sleep week (current week vs every past week, needs ≥3 logs this week + history)
  const sleepWeeks = new Map<string, number[]>()
  for (const l of allSleep) {
    const k = weekKey(l.date)
    sleepWeeks.set(k, [...(sleepWeeks.get(k) ?? []), l.durationMins])
  }
  const thisWeekSleep = sleepWeeks.get(nowWeek)
  if (thisWeekSleep && thisWeekSleep.length >= 3 && sleepWeeks.size >= 3) {
    const thisAvg = thisWeekSleep.reduce((a, b) => a + b, 0) / thisWeekSleep.length
    const isBest = [...sleepWeeks.entries()].every(([k, v]) =>
      k === nowWeek || v.length < 3 || v.reduce((a, b) => a + b, 0) / v.length <= thisAvg
    )
    if (isBest) personalBests.push('🌙 Best sleep week since you started tracking')
  }

  // 😊 Highest mood week
  const moodWeeks = new Map<string, number[]>()
  for (const m of allMoods) {
    const k = weekKey(m.date)
    moodWeeks.set(k, [...(moodWeeks.get(k) ?? []), m.mood])
  }
  const thisWeekMood = moodWeeks.get(nowWeek)
  if (thisWeekMood && thisWeekMood.length >= 3 && moodWeeks.size >= 3) {
    const thisAvg = thisWeekMood.reduce((a, b) => a + b, 0) / thisWeekMood.length
    const isBest = [...moodWeeks.entries()].every(([k, v]) =>
      k === nowWeek || v.length < 3 || v.reduce((a, b) => a + b, 0) / v.length <= thisAvg
    )
    if (isBest) personalBests.push('😊 Your brightest mood week on record')
  }

  // 🙏 Most gratitude entries in a month
  const gratMonths = new Map<string, number>()
  for (const g of allGratitudeDates) {
    const k = g.date.slice(0, 7)
    gratMonths.set(k, (gratMonths.get(k) ?? 0) + 1)
  }
  const thisMonthGrat = gratMonths.get(nowMonth) ?? 0
  if (thisMonthGrat >= 3 && gratMonths.size >= 2) {
    const isBest = [...gratMonths.entries()].every(([k, v]) => k === nowMonth || v <= thisMonthGrat)
    if (isBest) personalBests.push(`🙏 ${thisMonthGrat} gratitudes — your most thankful month yet`)
  }

  return NextResponse.json({
    personalBests,
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
