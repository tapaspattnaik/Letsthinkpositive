import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PATCH — mark a single notification as read
export async function PATCH(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userId = Number(session.user.id)
  const id     = Number(params.id)

  await prisma.notification.updateMany({
    where: { id, userId },   // userId guard prevents reading others' notifications
    data:  { read: true },
  })

  return NextResponse.json({ ok: true })
}
