import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET — today's check-in status for the logged-in user
export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ checkedIn: false, mood: null, streak: 0, longestStreak: 0 })
  }

  const userId  = Number(session.user.id)
  const today   = new Date().toISOString().split('T')[0]

  const [entry, user] = await Promise.all([
    prisma.moodEntry.findUnique({
      where:  { userId_date: { userId, date: today } },
      select: { mood: true },
    }),
    prisma.user.findUnique({
      where:  { id: userId },
      select: { currentStreak: true, longestStreak: true },
    }),
  ])

  return NextResponse.json({
    checkedIn:     !!entry,
    mood:          entry?.mood ?? null,
    streak:        user?.currentStreak  ?? 0,
    longestStreak: user?.longestStreak  ?? 0,
  })
}

// POST — save today's mood (1–5) and update streak
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userId = Number(session.user.id)
  const body   = await req.json()
  const mood   = Number(body.mood)

  if (!mood || mood < 1 || mood > 5)
    return NextResponse.json({ error: 'mood must be 1–5' }, { status: 400 })

  const date = new Date().toISOString().split('T')[0]

  await prisma.moodEntry.upsert({
    where:  { userId_date: { userId, date } },
    create: { userId, mood, note: null, date },
    update: { mood },
  })

  await updateStreak(userId)

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { currentStreak: true, longestStreak: true },
  })

  return NextResponse.json({
    checkedIn:     true,
    mood,
    streak:        user?.currentStreak  ?? 1,
    longestStreak: user?.longestStreak  ?? 1,
  })
}

async function updateStreak(userId: number) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
  })
  if (!user) return

  const today    = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const lastDate = user.lastActiveDate ? new Date(user.lastActiveDate) : null
  if (lastDate) lastDate.setHours(0, 0, 0, 0)
  const lastStr  = lastDate?.toISOString().split('T')[0]

  if (lastStr === todayStr) return  // already counted today

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
