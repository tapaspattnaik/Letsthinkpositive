import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST — touch streak (call on any meaningful user action: journal save, check-in, etc.)
export async function POST() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ ok: false })

  const userId = Number(session.user.id)
  const user   = await prisma.user.findUnique({
    where:  { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true, streakFreezes: true },
  })
  if (!user) return NextResponse.json({ ok: false })

  const today    = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const lastDate = user.lastActiveDate ? new Date(user.lastActiveDate) : null
  if (lastDate) lastDate.setHours(0, 0, 0, 0)
  const lastStr  = lastDate?.toISOString().split('T')[0]

  if (lastStr === todayStr) {
    // Already active today — just return current state
    return NextResponse.json({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      streakFreezes: user.streakFreezes,
    })
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yestStr   = yesterday.toISOString().split('T')[0]

  const dayBefore = new Date(today)
  dayBefore.setDate(dayBefore.getDate() - 2)
  const dayBeforeStr = dayBefore.toISOString().split('T')[0]

  let newStreak  = 1
  let freezes    = user.streakFreezes
  let freezeUsed = false

  if (lastStr === yestStr) {
    // Normal continuation
    newStreak = user.currentStreak + 1
  } else if (lastStr === dayBeforeStr && freezes > 0 && user.currentStreak > 1) {
    // Missed exactly one day — a streak freeze saves it 🧊
    newStreak  = user.currentStreak + 1
    freezes   -= 1
    freezeUsed = true
  }

  const longest = Math.max(newStreak, user.longestStreak)

  await prisma.user.update({
    where: { id: userId },
    data:  { currentStreak: newStreak, longestStreak: longest, lastActiveDate: today, streakFreezes: freezes },
  })

  if (freezeUsed) {
    // Tell the user their streak was saved (fire-and-forget)
    prisma.notification.create({
      data: {
        userId,
        type:    'streak_freeze_used',
        message: `🧊 A streak freeze saved your ${user.currentStreak}-day streak! You missed yesterday, but the chain lives on. (${freezes} freeze${freezes === 1 ? '' : 's'} left — earn more with badges.)`,
        link:    '/profile',
      },
    }).catch(() => {})
  }

  return NextResponse.json({
    currentStreak: newStreak,
    longestStreak: longest,
    streakFreezes: freezes,
    freezeUsed,
  })
}

// GET — fetch current streak
export async function GET() {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ currentStreak: 0, longestStreak: 0, streakFreezes: 0 })

  const user = await prisma.user.findUnique({
    where:  { id: Number(session.user.id) },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true, streakFreezes: true },
  })

  return NextResponse.json({
    currentStreak: user?.currentStreak ?? 0,
    longestStreak: user?.longestStreak ?? 0,
    streakFreezes: user?.streakFreezes ?? 0,
    lastActiveDate: user?.lastActiveDate ?? null,
  })
}
