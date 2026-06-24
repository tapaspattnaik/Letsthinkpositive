import { NextResponse } from 'next/server'
import { prisma }     from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })

  const myId = Number(session.user.id)

  // Fetch recent messages involving this user
  const messages = await prisma.directMessage.findMany({
    where: { OR: [{ senderId: myId }, { receiverId: myId }] },
    orderBy: { createdAt: 'desc' },
    take: 300,
    include: {
      sender:   { select: { id: true, name: true, avatarUrl: true } },
      receiver: { select: { id: true, name: true, avatarUrl: true } },
    },
  })

  // Group into conversations keyed by other user's ID
  const seen = new Map<number, {
    userId: number; name: string; avatar: string | null
    lastMessage: string; lastAt: string; unread: number
  }>()

  for (const msg of messages) {
    const isMe    = msg.senderId === myId
    const other   = isMe ? msg.receiver : msg.sender
    const otherId = other.id

    if (!seen.has(otherId)) {
      seen.set(otherId, {
        userId:      otherId,
        name:        other.name,
        avatar:      other.avatarUrl ?? null,
        lastMessage: msg.body.slice(0, 80),
        lastAt:      msg.createdAt.toISOString(),
        unread:      0,
      })
    }
    if (!isMe && !msg.readAt) {
      seen.get(otherId)!.unread++
    }
  }

  const convos = Array.from(seen.values()).sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
  )

  return NextResponse.json(convos)
}
