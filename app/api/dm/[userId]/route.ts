import { NextRequest, NextResponse } from 'next/server'
import { prisma }     from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/dm/[userId]  — message thread between current user and userId
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })

  const myId     = Number(session.user.id)
  const { userId } = await params
  const otherId  = Number(userId)
  if (!otherId) return NextResponse.json([], { status: 400 })

  // Fetch other user info
  const other = await prisma.user.findUnique({
    where:  { id: otherId },
    select: { id: true, name: true, avatarUrl: true },
  })
  if (!other) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: myId,    receiverId: otherId },
        { senderId: otherId, receiverId: myId    },
      ],
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
    select: {
      id: true, senderId: true, body: true, createdAt: true, readAt: true,
    },
  })

  return NextResponse.json({
    other: { id: other.id, name: other.name, avatar: other.avatarUrl },
    messages: messages.map(m => ({
      id:        m.id,
      fromMe:    m.senderId === myId,
      body:      m.body,
      createdAt: m.createdAt.toISOString(),
      readAt:    m.readAt?.toISOString() ?? null,
    })),
  })
}

// POST /api/dm/[userId]  — send a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const myId   = Number(session.user.id)
  const { userId } = await params
  const toId   = Number(userId)
  if (!toId || toId === myId) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const { body } = await req.json() as { body?: string }
  const text = (body ?? '').trim()
  if (!text || text.length > 2000) return NextResponse.json({ error: 'Invalid message' }, { status: 400 })

  const receiver = await prisma.user.findUnique({ where: { id: toId }, select: { id: true } })
  if (!receiver) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const msg = await prisma.directMessage.create({
    data: { senderId: myId, receiverId: toId, body: text },
  })

  return NextResponse.json({
    id: msg.id, fromMe: true, body: msg.body,
    createdAt: msg.createdAt.toISOString(), readAt: null,
  }, { status: 201 })
}
