import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// ── "On this day" memory resurfacing ────────────────────────────────────────
// Returns the user's gratitude entries and daily intentions written on this
// same calendar day in previous years — or, while the app is young, on this
// same day-of-month in previous months. Client merges with localStorage journal.

interface Memory {
  type:    'gratitude' | 'intention'
  text:    string
  date:    string   // YYYY-MM-DD
  ago:     string   // human label: "1 year ago", "3 months ago"
}

function agoLabel(dateStr: string, todayStr: string): string {
  const [y, m]   = dateStr.split('-').map(Number)
  const [ty, tm] = todayStr.split('-').map(Number)
  const months = (ty - y) * 12 + (tm - m)
  if (months >= 12) {
    const years = Math.floor(months / 12)
    return years === 1 ? '1 year ago' : `${years} years ago`
  }
  return months === 1 ? '1 month ago' : `${months} months ago`
}

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ memories: [] })

  const userId   = Number(session.user.id)
  const now      = new Date()
  const todayStr = now.toISOString().split('T')[0]          // YYYY-MM-DD
  const monthDay = todayStr.slice(4)                         // -MM-DD
  const dayOnly  = todayStr.slice(7)                         // -DD

  try {
    // Same calendar date, previous years (strongest memories)
    const [gratYearly, intentYearly] = await Promise.all([
      prisma.gratitudeEntry.findMany({
        where:   { userId, date: { endsWith: monthDay, not: todayStr } },
        select:  { content: true, date: true },
        orderBy: { date: 'desc' },
        take:    3,
      }),
      prisma.dailyIntention.findMany({
        where:   { userId, date: { endsWith: monthDay, not: todayStr } },
        select:  { word: true, intention: true, date: true },
        orderBy: { date: 'desc' },
        take:    2,
      }),
    ])

    let memories: Memory[] = [
      ...gratYearly.map(g => ({
        type: 'gratitude' as const, text: g.content, date: g.date, ago: agoLabel(g.date, todayStr),
      })),
      ...intentYearly.map(i => ({
        type: 'intention' as const, text: `"${i.word}" — ${i.intention}`, date: i.date, ago: agoLabel(i.date, todayStr),
      })),
    ]

    // Young-app fallback: same day-of-month in previous months
    if (memories.length === 0) {
      const [gratMonthly, intentMonthly] = await Promise.all([
        prisma.gratitudeEntry.findMany({
          where:   { userId, date: { endsWith: dayOnly, lt: todayStr.slice(0, 8) } },
          select:  { content: true, date: true },
          orderBy: { date: 'desc' },
          take:    2,
        }),
        prisma.dailyIntention.findMany({
          where:   { userId, date: { endsWith: dayOnly, lt: todayStr.slice(0, 8) } },
          select:  { word: true, intention: true, date: true },
          orderBy: { date: 'desc' },
          take:    1,
        }),
      ])
      memories = [
        ...gratMonthly.map(g => ({
          type: 'gratitude' as const, text: g.content, date: g.date, ago: agoLabel(g.date, todayStr),
        })),
        ...intentMonthly.map(i => ({
          type: 'intention' as const, text: `"${i.word}" — ${i.intention}`, date: i.date, ago: agoLabel(i.date, todayStr),
        })),
      ]
    }

    // Newest first, max 3
    memories.sort((a, b) => b.date.localeCompare(a.date))
    return NextResponse.json({ memories: memories.slice(0, 3) })
  } catch {
    return NextResponse.json({ memories: [] })
  }
}
