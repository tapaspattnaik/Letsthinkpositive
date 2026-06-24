import { NextResponse }  from 'next/server'
import { prisma }        from '@/lib/db'
import { getSession }    from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Maps DB table → human label + icon
const ACTIVITIES = [
  { key: 'journal',   label: 'Journalling',      icon: '📓' },
  { key: 'breathing', label: 'Breathing',         icon: '💨' },
  { key: 'gratitude', label: 'Gratitude entries', icon: '🙏' },
  { key: 'habits',    label: 'Habit check-ins',   icon: '🎯' },
  { key: 'sleep',     label: 'Logging sleep',     icon: '🌙' },
  { key: 'intention', label: 'Setting intention', icon: '🌅' },
]

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json(null)
  const userId = Number(session.user.id)

  // Fetch last 90 days of mood + activities
  const since = new Date(Date.now() - 90 * 86400000)
  const toStr = (d: Date) => d.toISOString().slice(0, 10)

  const [moods, journals, gratitudes, habits, sleeps, intentions] = await Promise.all([
    prisma.moodEntry.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { date: 'asc' },
      select: { mood: true, date: true },
    }),
    prisma.gratitudeEntry.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.gratitudeEntry.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.habitLog.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { date: true },
    }),
    prisma.sleepLog.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { date: true },
    }),
    prisma.dailyIntention.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ])

  if (moods.length < 5) return NextResponse.json(null) // not enough data

  // Build sets of active dates per activity
  const activeDates: Record<string, Set<string>> = {
    journal:   new Set(journals.map(j  => toStr(j.createdAt))),
    breathing: new Set(), // no dedicated log table — approximate from coach sessions
    gratitude: new Set(gratitudes.map(g => toStr(g.createdAt))),
    habits:    new Set(habits.map(h    => h.date)),
    sleep:     new Set(sleeps.map(s    => s.date)),
    intention: new Set(intentions.map(i => toStr(i.createdAt))),
  }

  const moodMap = new Map(moods.map(m => [m.date, m.mood]))

  // For each low-mood day (≤ 2), check what activities happened that day / next day
  // and whether mood improved the following day
  const scores: Record<string, { improvedCount: number; totalLowDays: number }> = {}
  for (const act of ACTIVITIES) scores[act.key] = { improvedCount: 0, totalLowDays: 0 }

  for (const [date, mood] of moodMap) {
    if (mood > 2) continue // only look at low-mood days
    const nextDate = toStr(new Date(new Date(date).getTime() + 86400000))
    const nextMood = moodMap.get(nextDate)
    if (!nextMood) continue // no data for next day

    for (const act of ACTIVITIES) {
      const didActivity = activeDates[act.key].has(date) || activeDates[act.key].has(nextDate)
      if (didActivity) {
        scores[act.key].totalLowDays++
        if (nextMood > mood) scores[act.key].improvedCount++
      }
    }
  }

  // Rank by improvement rate (min 2 data points)
  const ranked = ACTIVITIES
    .map(act => ({
      ...act,
      ...scores[act.key],
      rate: scores[act.key].totalLowDays >= 2
        ? scores[act.key].improvedCount / scores[act.key].totalLowDays
        : 0,
    }))
    .filter(a => a.totalLowDays >= 2)
    .sort((a, b) => b.rate - a.rate)

  if (!ranked.length) return NextResponse.json(null)

  const top = ranked[0]
  return NextResponse.json({
    activity:    top.label,
    icon:        top.icon,
    rate:        Math.round(top.rate * 100),
    sampleCount: top.totalLowDays,
  })
}
