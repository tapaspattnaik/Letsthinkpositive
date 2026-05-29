import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PATCH — mark a single notification as read
export async function PATCH(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userId = Number(session.user.id)

  await prisma.notification.updateMany({
    where: { id: Number(id), userId },   // userId guard prevents reading others' notifications
    data:  { read: true },
  })

  return NextResponse.json({ ok: true })
}
