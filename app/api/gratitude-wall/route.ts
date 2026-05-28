import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

function todayDate(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

export async function GET() {
  try {
    const date = todayDate()

    const [entries, total] = await Promise.all([
      prisma.gratitudeEntry.findMany({
        where:   { date },
        orderBy: [{ hearts: 'desc' }, { createdAt: 'desc' }],
        take:    50,
        select:  { id: true, name: true, content: true, hearts: true, createdAt: true },
      }),
      prisma.gratitudeEntry.count({ where: { date } }),
    ])

    return NextResponse.json({ entries, total, date })
  } catch (err) {
    console.error('Gratitude Wall GET error:', err)
    return NextResponse.json({ error: 'Could not load entries' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    const { content, name, anonymous } = await req.json()

    if (!content?.trim())
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })

    const trimmed = content.trim()
    if (trimmed.length > 280)
      return NextResponse.json({ error: 'Content must be 280 characters or fewer' }, { status: 400 })

    const isLoggedIn = !!session?.user?.id
    let displayName = 'Anonymous'

    if (!anonymous) {
      if (isLoggedIn && session.user?.name) {
        displayName = session.user.name.slice(0, 100)
      } else if (name?.trim()) {
        displayName = name.trim().slice(0, 100)
      }
    }

    const entry = await prisma.gratitudeEntry.create({
      data: {
        content:  trimmed,
        name:     displayName,
        date:     todayDate(),
        userId:   isLoggedIn ? Number(session.user.id) : null,
      },
      select: { id: true, name: true, content: true, hearts: true, createdAt: true },
    })

    return NextResponse.json({ ok: true, entry })
  } catch (err) {
    console.error('Gratitude Wall POST error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
