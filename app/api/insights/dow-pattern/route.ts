import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/db'
import { getSession }   from '@/lib/auth'

export const dynamic = 'force-dynamic'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json(null)
  const userId = Number(session.user.id)

  const since = new Date(Date.now() - 90 * 86400000)
  const moods = await prisma.moodEntry.findMany({
    where:   { userId, createdAt: { gte: since } },
    select:  { mood: true, date: true },
    orderBy: { date: 'asc' },
  })

  if (moods.length < 14) return NextResponse.json(null) // need at least 2 weeks

  // Average mood per day-of-week
  const sums   = Array(7).fill(0)
  const counts = Array(7).fill(0)
  for (const m of moods) {
    const dow = new Date(m.date + 'T12:00:00').getDay()
    sums[dow]   += m.mood
    counts[dow]++
  }

  const avgs = sums.map((s, i) => counts[i] >= 2 ? s / counts[i] : null)
  const overall = moods.reduce((s, m) => s + m.mood, 0) / moods.length

  // Find the weekday with the lowest average (at least 0.4 below overall)
  let lowestDow = -1, lowestAvg = Infinity
  for (let i = 0; i < 7; i++) {
    const avg = avgs[i]
    if (avg !== null && avg < lowestAvg && avg < overall - 0.4) {
      lowestAvg = avg; lowestDow = i
    }
  }

  if (lowestDow === -1) return NextResponse.json(null)

  // Only show the nudge the evening before (after 5 pm local) or on the day itself
  const todayDow    = new Date().getDay()
  const tomorrowDow = (todayDow + 1) % 7
  const hour        = new Date().getHours()

  const showToday    = todayDow    === lowestDow
  const showTomorrow = tomorrowDow === lowestDow && hour >= 17

  if (!showToday && !showTomorrow) return NextResponse.json(null)

  const day = DAYS[lowestDow]
  return NextResponse.json({
    day,
    avgMood: Math.round(lowestAvg * 10) / 10,
    isTomorrow: showTomorrow && !showToday,
  })
}
