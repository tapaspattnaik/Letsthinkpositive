import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

function today(): string {
  return new Date().toISOString().split('T')[0]
}

// GET — return today's intention for the logged-in user (or null)
export async function GET() {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ intention: null })

  const userId = Number(session.user.id)
  const date   = today()

  const entry = await prisma.dailyIntention.findUnique({
    where:  { userId_date: { userId, date } },
    select: { id: true, word: true, intention: true, kindness: true, reflection: true, date: true, createdAt: true },
  })

  return NextResponse.json({ intention: entry ?? null })
}

// POST — create or update today's intention
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userId = Number(session.user.id)
  const body   = await req.json()
  const { word, intention, kindness } = body

  if (!word?.trim() || !intention?.trim() || !kindness?.trim())
    return NextResponse.json({ error: 'word, intention, and kindness are all required' }, { status: 400 })

  if (word.trim().includes(' '))
    return NextResponse.json({ error: 'word must be a single word' }, { status: 400 })

  const date = today()

  const entry = await prisma.dailyIntention.upsert({
    where:  { userId_date: { userId, date } },
    create: { userId, word: word.trim(), intention: intention.trim(), kindness: kindness.trim(), date },
    update: { word: word.trim(), intention: intention.trim(), kindness: kindness.trim() },
  })

  return NextResponse.json({ intention: entry })
}

// PATCH — add or update evening reflection
export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userId = Number(session.user.id)
  const body   = await req.json()
  const { reflection } = body

  if (!reflection?.trim())
    return NextResponse.json({ error: 'reflection is required' }, { status: 400 })

  const date = today()

  const existing = await prisma.dailyIntention.findUnique({
    where: { userId_date: { userId, date } },
  })

  if (!existing)
    return NextResponse.json({ error: 'No intention set for today' }, { status: 404 })

  const updated = await prisma.dailyIntention.update({
    where: { userId_date: { userId, date } },
    data:  { reflection: reflection.trim() },
  })

  return NextResponse.json({ intention: updated })
}
