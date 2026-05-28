import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET — fetch user's habits + today's completion status
export async function GET() {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userId  = Number(session.user.id)
  const today   = new Date().toISOString().split('T')[0]

  const habits = await prisma.habit.findMany({
    where:   { userId, active: true },
    orderBy: { createdAt: 'asc' },
    include: {
      logs: {
        where:  { date: today },
        select: { id: true },
      },
    },
  })

  return NextResponse.json(habits.map(h => ({
    id:        h.id,
    name:      h.name,
    emoji:     h.emoji,
    createdAt: h.createdAt,
    doneToday: h.logs.length > 0,
  })))
}

// POST — create a new habit
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userId = Number(session.user.id)
  const { name, emoji } = await req.json()

  if (!name?.trim())
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const existing = await prisma.habit.count({ where: { userId, active: true } })
  if (existing >= 20)
    return NextResponse.json({ error: 'Maximum 20 habits allowed' }, { status: 400 })

  const habit = await prisma.habit.create({
    data: {
      userId,
      name:  name.trim().slice(0, 200),
      emoji: emoji ?? '✅',
    },
  })

  return NextResponse.json({ ...habit, doneToday: false })
}
