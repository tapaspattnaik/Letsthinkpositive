import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET — fetch posts (members only)
export async function GET(_: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Members only.' }, { status: 401 })

  const circle = await prisma.circle.findUnique({ where: { slug: params.slug } })
  if (!circle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const userId   = Number(session.user.id)
  const isMember = await prisma.groupMember.findUnique({
    where: { circleId_userId: { circleId: circle.id, userId } },
  })
  if (!isMember) return NextResponse.json({ error: 'Join this circle to view posts.' }, { status: 403 })

  const posts = await prisma.groupPost.findMany({
    where:   { circleId: circle.id },
    orderBy: { createdAt: 'desc' },
    take:    50,
    include: {
      user:     { select: { id: true, name: true, avatarUrl: true } },
      _count:   { select: { likes: true, comments: true } },
      likes:    { where: { userId }, select: { id: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  })

  return NextResponse.json(posts.map(p => ({
    ...p,
    likeCount:    p._count.likes,
    commentCount: p._count.comments,
    likedByMe:    p.likes.length > 0,
    likes:        undefined,
    _count:       undefined,
  })))
}

// POST — create post
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Sign in to post.' }, { status: 401 })

  const circle = await prisma.circle.findUnique({ where: { slug: params.slug } })
  if (!circle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const userId   = Number(session.user.id)
  const isMember = await prisma.groupMember.findUnique({
    where: { circleId_userId: { circleId: circle.id, userId } },
  })
  if (!isMember) return NextResponse.json({ error: 'Join this circle to post.' }, { status: 403 })

  const { body } = await req.json()
  if (!body?.trim()) return NextResponse.json({ error: 'Post body required.' }, { status: 400 })

  const post = await prisma.groupPost.create({
    data: { circleId: circle.id, userId, body: body.trim().slice(0, 1000) },
    include: {
      user:     { select: { id: true, name: true, avatarUrl: true } },
      comments: true,
    },
  })

  return NextResponse.json({ ...post, likeCount: 0, commentCount: 0, likedByMe: false })
}
