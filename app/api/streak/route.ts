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
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
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
    })
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yestStr   = yesterday.toISOString().split('T')[0]

  const newStreak = lastStr === yestStr ? user.currentStreak + 1 : 1
  const longest   = Math.max(newStreak, user.longestStreak)

  await prisma.user.update({
    where: { id: userId },
    data:  { currentStreak: newStreak, longestStreak: longest, lastActiveDate: today },
  })

  return NextResponse.json({ currentStreak: newStreak, longestStreak: longest })
}

// GET — fetch current streak
export async function GET() {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ currentStreak: 0, longestStreak: 0 })

  const user = await prisma.user.findUnique({
    where:  { id: Number(session.user.id) },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
  })

  return NextResponse.json({
    currentStreak: user?.currentStreak ?? 0,
    longestStreak: user?.longestStreak ?? 0,
    lastActiveDate: user?.lastActiveDate ?? null,
  })
}
