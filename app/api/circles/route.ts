import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  const userId  = session?.user?.id ? Number(session.user.id) : null

  const circles = await prisma.circle.findMany({
    orderBy: { id: 'asc' },
    include: {
      _count:  { select: { members: true, posts: true } },
      members: userId ? { where: { userId }, select: { id: true } } : false,
    },
  })

  return NextResponse.json(circles.map(c => ({
    ...c,
    memberCount: c._count.members,
    postCount:   c._count.posts,
    isMember:    userId ? (c.members as {id:number}[]).length > 0 : false,
    members:     undefined,
    _count:      undefined,
  })))
}

// POST — create a new circle (any authenticated user)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id)
      return NextResponse.json({ error: 'Sign in to create a circle.' }, { status: 401 })

    const { name, description, icon, isPrivate } = await req.json()

    if (!name?.trim())        return NextResponse.json({ error: 'Name is required.' },        { status: 400 })
    if (!description?.trim()) return NextResponse.json({ error: 'Description is required.' }, { status: 400 })
    if (name.trim().length > 60) return NextResponse.json({ error: 'Name must be under 60 characters.' }, { status: 400 })

    // Generate a unique slug from the name
    const base = name.trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50)
    const slug = `${base}-${Date.now().toString(36)}`

    // Check slug uniqueness (just in case)
    const existing = await prisma.circle.findUnique({ where: { slug } })
    if (existing) return NextResponse.json({ error: 'A circle with this name already exists.' }, { status: 409 })

    const userId = Number(session.user.id)

    // Create circle + auto-join the creator as a member
    const circle = await prisma.circle.create({
      data: {
        name:        name.trim().slice(0, 60),
        slug,
        description: description.trim().slice(0, 500),
        icon:        icon?.trim() || '🌿',
        isPrivate:   isPrivate !== false,
        members: {
          create: { userId, role: 'admin' }
        }
      },
      include: {
        _count:  { select: { members: true, posts: true } },
        members: { where: { userId }, select: { id: true } },
      },
    })

    return NextResponse.json({
      ...circle,
      memberCount: circle._count.members,
      postCount:   circle._count.posts,
      isMember:    true,
      members:     undefined,
      _count:      undefined,
    })
  } catch (err) {
    console.error('Create circle error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
