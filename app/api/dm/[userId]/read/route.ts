import { NextRequest, NextResponse } from 'next/server'
import { prisma }     from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// PATCH /api/dm/[userId]/read  — mark messages from userId as read
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 })

  const myId = Number(session.user.id)
  const { userId } = await params
  const fromId = Number(userId)
  if (!fromId) return NextResponse.json({ ok: false }, { status: 400 })

  await prisma.directMessage.updateMany({
    where: { senderId: fromId, receiverId: myId, readAt: null },
    data:  { readAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
