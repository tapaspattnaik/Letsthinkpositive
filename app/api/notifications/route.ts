import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET — fetch user's notifications (most recent 20)
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id)
      return NextResponse.json([], { status: 401 })

    const userId = Number(session.user.id)

    const notifications = await prisma.notification.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      take:    20,
    })

    return NextResponse.json(notifications)
  } catch (err) {
    // Always return valid JSON — never let a DB error become an HTML 503
    // that the client would treat as a failure and retry-storm.
    console.error('Notifications GET error:', err)
    return NextResponse.json([], { status: 200 })
  }
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
