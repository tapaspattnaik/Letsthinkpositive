import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET — fetch user's favourite tools
export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ tools: [] })

  const user = await prisma.user.findUnique({
    where:  { id: Number(session.user.id) },
    select: { favouriteTools: true },
  })

  try {
    const tools = JSON.parse(user?.favouriteTools ?? '[]')
    return NextResponse.json({ tools })
  } catch {
    return NextResponse.json({ tools: [] })
  }
}

// PATCH — save favourite tools (array of slugs, max 6)
export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { tools } = await req.json()
  if (!Array.isArray(tools)) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const safe = tools.slice(0, 6).filter((t: unknown) => typeof t === 'string')

  await prisma.user.update({
    where: { id: Number(session.user.id) },
    data:  { favouriteTools: JSON.stringify(safe) },
  })

  return NextResponse.json({ tools: safe })
}
