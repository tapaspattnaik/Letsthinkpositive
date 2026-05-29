import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// DELETE — archive (soft-delete) a habit
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userId  = Number(session.user.id)
  const habitId = Number(id)

  // Only allow owner
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } })
  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.habit.update({ where: { id: habitId }, data: { active: false } })
  return NextResponse.json({ ok: true })
}
