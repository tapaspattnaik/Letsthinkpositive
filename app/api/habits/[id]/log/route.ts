import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST — toggle today's completion for a habit
export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userId  = Number(session.user.id)
  const habitId = Number(id)
  const today   = new Date().toISOString().split('T')[0]

  // Verify ownership
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } })
  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existing = await prisma.habitLog.findUnique({
    where: { habitId_date: { habitId, date: today } },
  })

  if (existing) {
    await prisma.habitLog.delete({ where: { id: existing.id } })
    return NextResponse.json({ done: false })
  }

  await prisma.habitLog.create({ data: { habitId, userId, date: today } })

  // Touch streak
  try {
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
    })
    if (user) {
      const todayDate = new Date(); todayDate.setHours(0,0,0,0)
      const todayStr  = todayDate.toISOString().split('T')[0]
      const lastDate  = user.lastActiveDate ? new Date(user.lastActiveDate) : null
      if (lastDate) lastDate.setHours(0,0,0,0)
      const lastStr   = lastDate?.toISOString().split('T')[0]
      if (lastStr !== todayStr) {
        const yesterday = new Date(todayDate); yesterday.setDate(yesterday.getDate()-1)
        const yestStr   = yesterday.toISOString().split('T')[0]
        const newStreak = lastStr === yestStr ? user.currentStreak + 1 : 1
        const longest   = Math.max(newStreak, user.longestStreak)
        await prisma.user.update({ where: { id: userId }, data: { currentStreak: newStreak, longestStreak: longest, lastActiveDate: todayDate } })
      }
    }
  } catch { /* streak update is non-critical */ }

  return NextResponse.json({ done: true })
}

// GET — streak / completion history for last 7 weeks
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userId  = Number(session.user.id)
  const habitId = Number(id)

  // last 49 days
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 48)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  const logs = await prisma.habitLog.findMany({
    where:   { habitId, userId, date: { gte: cutoffStr } },
    select:  { date: true },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(logs.map(l => l.date))
}
