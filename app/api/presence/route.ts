import { NextRequest, NextResponse } from 'next/server'
import { prisma }     from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const ONLINE_MS = 5 * 60 * 1000 // 5 minutes

// GET /api/presence?ids=1,2,3  → { "1": true, "2": false, ... }
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('ids') ?? ''
  const ids = raw.split(',').map(Number).filter(n => n > 0).slice(0, 50)
  if (!ids.length) return NextResponse.json({})

  const rows = await prisma.userPresence.findMany({
    where: { userId: { in: ids } },
    select: { userId: true, lastSeenAt: true },
  })

  const cutoff = new Date(Date.now() - ONLINE_MS)
  const result: Record<number, boolean> = {}
  for (const id of ids) result[id] = false
  for (const r of rows) result[r.userId] = r.lastSeenAt > cutoff

  return NextResponse.json(result)
}

// POST /api/presence  → updates current user's lastSeenAt
export async function POST() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 })

  const userId = Number(session.user.id)
  await prisma.userPresence.upsert({
    where:  { userId },
    create: { userId, lastSeenAt: new Date() },
    update: { lastSeenAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
