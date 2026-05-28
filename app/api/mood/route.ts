import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET — last 30 days of mood entries for the logged-in user
export async function GET() {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userId = Number(session.user.id)

  // Get last 30 calendar dates
  const entries = await prisma.moodEntry.findMany({
    where:   { userId },
    orderBy: { date: 'desc' },
    take:    90,
    select:  { id: true, mood: true, note: true, date: true, createdAt: true },
  })

  return NextResponse.json(entries)
}

// POST — log or update today's mood
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userId = Number(session.user.id)
  const { mood, note } = await req.json()

  if (!mood || mood < 1 || mood > 5)
    return NextResponse.json({ error: 'mood must be 1–5' }, { status: 400 })

  // Today in YYYY-MM-DD (UTC)
  const date = new Date().toISOString().split('T')[0]

  const entry = await prisma.moodEntry.upsert({
    where:  { userId_date: { userId, date } },
    create: { userId, mood, note: note ?? null, date },
    update: { mood, note: note ?? null },
  })

  // Also update streak
  await updateStreak(userId)

  return NextResponse.json(entry)
}

async function updateStreak(userId: number) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
  })
  if (!user) return

  const today     = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr  = today.toISOString().split('T')[0]

  const lastDate  = user.lastActiveDate ? new Date(user.lastActiveDate) : null
  if (lastDate) lastDate.setHours(0, 0, 0, 0)

  const lastStr   = lastDate?.toISOString().split('T')[0]

  if (lastStr === todayStr) return   // already counted today

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yestStr   = yesterday.toISOString().split('T')[0]

  const newStreak = lastStr === yestStr ? user.currentStreak + 1 : 1
  const longest   = Math.max(newStreak, user.longestStreak)

  await prisma.user.update({
    where: { id: userId },
    data:  { currentStreak: newStreak, longestStreak: longest, lastActiveDate: today },
  })
}
