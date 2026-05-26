import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const posts = await prisma.communityPost.findMany({
      where:   { approved: true },
      orderBy: { createdAt: 'desc' },
      take:    30,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    })
    return NextResponse.json(posts)
  } catch (err) {
    console.error('Community fetch error:', err)
    return NextResponse.json({ error: 'Could not load posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    const { title, body, author, tags } = await req.json()

    if (!title?.trim() || !body?.trim())
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })

    const isLoggedIn = !!session?.user?.id

    const post = await prisma.communityPost.create({
      data: {
        title:    title.trim().slice(0, 200),
        body:     body.trim().slice(0, 2000),
        author:   isLoggedIn ? (session.user?.name ?? 'Member') : (author?.trim() || 'Anonymous').slice(0, 100),
        tags:     (tags?.trim() || '').slice(0, 500),
        approved: isLoggedIn, // logged-in users go live immediately
        userId:   isLoggedIn ? Number(session.user.id) : null,
      },
    })

    // Award "first-post" badge if this is the user's first approved post
    if (isLoggedIn) {
      const userId  = Number(session.user.id)
      const postCount = await prisma.communityPost.count({ where: { userId, approved: true } })
      if (postCount === 1) {
        const badge = await prisma.badge.findUnique({ where: { slug: 'first-post' } })
        if (badge) {
          const alreadyHas = await prisma.userBadge.findUnique({
            where: { userId_badgeId: { userId, badgeId: badge.id } },
          })
          if (!alreadyHas) await prisma.userBadge.create({ data: { userId, badgeId: badge.id } })
        }
      }
    }

    return NextResponse.json({ ok: true, live: isLoggedIn })
  } catch (err) {
    console.error('Community post error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
