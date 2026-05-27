import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET — fetch user's notifications (most recent 30)
export async function GET() {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json([], { status: 401 })

  const userId = Number(session.user.id)

  const notifications = await prisma.notification.findMany({
    where:   { userId },
    orderBy: { createdAt: 'desc' },
    take:    30,
  })

  return NextResponse.json(notifications)
}

// PATCH — mark all notifications as read
export async function PATCH() {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userId = Number(session.user.id)

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data:  { read: true },
  })

  return NextResponse.json({ ok: true })
}
