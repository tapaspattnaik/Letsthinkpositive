import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// ── Year in Positivity — wrapped stats ──────────────────────────────────────
// Aggregates the user's year into a handful of warm, shareable numbers.
// ?year=2026 optional — defaults to the current year.

const MOOD_LABELS: Record<number, { label: string; emoji: string }> = {
  1: { label: 'Tough',  emoji: '😔' },
  2: { label: 'Low',    emoji: '😕' },
  3: { label: 'Okay',   emoji: '😐' },
  4: { label: 'Good',   emoji: '🙂' },
  5: { label: 'Great',  emoji: '😄' },
}

export async function GET(req: Request) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const userId = Number(session.user.id)

  const url  = new URL(req.url)
  const year = Number(url.searchParams.get('year')) || new Date().getFullYear()
  const yearStart = new Date(`${year}-01-01T00:00:00Z`)
  const yearEnd   = new Date(`${year + 1}-01-01T00:00:00Z`)
  const yearPrefix = `${year}-`

  try {
    const [user, moods, gratitudes, sleepLogs, intentions, badges, kindActs] = await Promise.all([
      prisma.user.findUnique({
        where:  { id: userId },
        select: { name: true, longestStreak: true, createdAt: true },
      }),
      prisma.moodEntry.findMany({
        where:  { userId, date: { startsWith: yearPrefix } },
        select: { mood: true, date: true },
      }),
      prisma.gratitudeEntry.findMany({
        where:  { userId, date: { startsWith: yearPrefix } },
        select: { content: true, date: true },
      }),
      prisma.sleepLog.findMany({
        where:  { userId, date: { startsWith: yearPrefix } },
        select: { durationMins: true },
      }),
      prisma.dailyIntention.findMany({
        where:  { userId, date: { startsWith: yearPrefix } },
        select: { word: true },
      }),
      prisma.userBadge.findMany({
        where:   { userId, earnedAt: { gte: yearStart, lt: yearEnd } },
        include: { badge: { select: { name: true, icon: true } } },
      }),
      prisma.kindnessAct.count({
        where: { userId, createdAt: { gte: yearStart, lt: yearEnd } },
      }),
    ])

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Mood stats
    const moodAvg = moods.length
      ? moods.reduce((s, m) => s + m.mood, 0) / moods.length
      : null
    const moodCounts = new Map<number, number>()
    for (const m of moods) moodCounts.set(m.mood, (moodCounts.get(m.mood) ?? 0) + 1)
    const topMoodVal = [...moodCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    const topMood = topMoodVal ? MOOD_LABELS[topMoodVal] : null

    // Active days = distinct dates across practices
    const activeDates = new Set<string>([
      ...moods.map(m => m.date),
      ...gratitudes.map(g => g.date),
    ])

    // Most-practised tool (by log counts)
    const practiceCounts: { label: string; icon: string; count: number }[] = [
      { label: 'Mood check-ins',    icon: '📊', count: moods.length      },
      { label: 'Gratitude moments', icon: '🙏', count: gratitudes.length },
      { label: 'Sleep logs',        icon: '🌙', count: sleepLogs.length  },
      { label: 'Daily intentions',  icon: '🌅', count: intentions.length },
    ].sort((a, b) => b.count - a.count)
    const topPractice = practiceCounts[0]?.count > 0 ? practiceCounts[0] : null

    // Kindest line — the longest gratitude written this year
    const kindestLine = gratitudes.length
      ? [...gratitudes].sort((a, b) => b.content.length - a.content.length)[0].content
      : null

    // Most-set intention word
    const wordCounts = new Map<string, number>()
    for (const i of intentions) {
      const w = i.word.trim().toLowerCase()
      if (w) wordCounts.set(w, (wordCounts.get(w) ?? 0) + 1)
    }
    const topWord = [...wordCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

    const totalSleepHours = Math.round(sleepLogs.reduce((s, l) => s + l.durationMins, 0) / 60)

    return NextResponse.json({
      year,
      name:           user.name.split(' ')[0],
      activeDays:     activeDates.size,
      moodLogs:       moods.length,
      moodAvg:        moodAvg !== null ? Math.round(moodAvg * 10) / 10 : null,
      topMood,
      gratitudes:     gratitudes.length,
      kindestLine,
      longestStreak:  user.longestStreak,
      badges:         badges.map(b => ({ name: b.badge.name, icon: b.badge.icon })),
      topPractice,
      topWord,
      totalSleepHours: totalSleepHours > 0 ? totalSleepHours : null,
      kindnessActs:   kindActs,
      hasData:        activeDates.size > 0 || sleepLogs.length > 0 || badges.length > 0,
    })
  } catch (err) {
    console.error('Wrapped API error:', err)
    return NextResponse.json({ error: 'Could not build your year in positivity.' }, { status: 500 })
  }
}
