import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET — all saved quotes for the logged-in user
export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })

  const quotes = await prisma.savedQuote.findMany({
    where:   { userId: Number(session.user.id) },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(quotes)
}

// POST — save a new quote
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to save quotes.' }, { status: 401 })

  const { text, attribution, source } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Quote text required.' }, { status: 400 })

  try {
    const quote = await prisma.savedQuote.create({
      data: {
        userId:      Number(session.user.id),
        text:        text.trim().slice(0, 500),
        attribution: attribution?.trim().slice(0, 200) ?? null,
        source:      source ?? 'user',
      },
    })
    return NextResponse.json(quote)
  } catch {
    // Unique constraint = already saved
    return NextResponse.json({ error: 'Already saved.', alreadySaved: true }, { status: 409 })
  }
}

// DELETE — remove a saved quote by id
export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await req.json()
  await prisma.savedQuote.deleteMany({
    where: { id: Number(id), userId: Number(session.user.id) },
  })
  return NextResponse.json({ ok: true })
}
