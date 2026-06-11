import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session  = await getSession()
    const userId   = session?.user?.id ? Number(session.user.id) : null
    const { searchParams } = new URL(req.url)
    const postType = searchParams.get('type') ?? 'story'  // story | wish

    const posts = await prisma.communityPost.findMany({
      where:   { approved: true, postType },
      orderBy: { createdAt: 'desc' },
      take:    40,
      include: {
        user:      { select: { id: true, name: true, avatarUrl: true } },
        _count:    { select: { likes: true } },
        likes:     userId ? { where: { userId }, select: { id: true } } : false,
        reactions: postType === 'wish' ? { select: { emoji: true, userId: true } } : false,
      },
    })

    return NextResponse.json(posts.map(p => {
      // Group reaction counts per emoji
      const allReactions = (postType === 'wish' && p.reactions)
        ? (p.reactions as { emoji: string; userId: number }[])
        : []
      const reactionCounts: Record<string, number> = {}
      allReactions.forEach(r => { reactionCounts[r.emoji] = (reactionCounts[r.emoji] ?? 0) + 1 })
      const myReactions = userId
        ? allReactions.filter(r => r.userId === userId).map(r => r.emoji)
        : []

      let images: string[] = []
      try { images = JSON.parse(p.images || '[]') } catch { /* noop */ }

      return {
        id:             p.id,
        title:          p.title,
        body:           p.body,
        author:         p.author,
        tags:           p.tags,
        images,
        postType:       p.postType,
        createdAt:      p.createdAt,
        user:           p.user,
        likeCount:      p._count.likes,
        likedByMe:      userId ? (p.likes as {id:number}[]).length > 0 : false,
        reactionCounts,
        myReactions,
      }
    }))
  } catch (err) {
    console.error('Community fetch error:', err)
    return NextResponse.json({ error: 'Could not load posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    const { title, body, author, tags, postType, images } = await req.json()

    if (!title?.trim() || !body?.trim())
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })

    const type      = postType === 'wish' ? 'wish' : 'story'
    const isLoggedIn = !!session?.user?.id

    // Images: logged-in users only, must be our own uploads, max 4
    const safeImages: string[] = (isLoggedIn && Array.isArray(images))
      ? images.filter((u: unknown) => typeof u === 'string' && u.startsWith('/uploads/')).slice(0, 4)
      : []

    const post = await prisma.communityPost.create({
      data: {
        title:    title.trim().slice(0, 200),
        body:     body.trim().slice(0, 2000),
        author:   isLoggedIn ? (session.user?.name ?? 'Member') : (author?.trim() || 'Anonymous').slice(0, 100),
        tags:     (tags?.trim() || '').slice(0, 500),
        images:   JSON.stringify(safeImages),
        postType: type,
        approved: isLoggedIn,
        userId:   isLoggedIn ? Number(session.user.id) : null,
      },
    })

    // First-post badge (stories only)
    if (isLoggedIn && type === 'story') {
      const userId   = Number(session.user.id)
      const postCount = await prisma.communityPost.count({ where: { userId, approved: true } })
      if (postCount === 1) {
        const badge = await prisma.badge.findUnique({ where: { slug: 'first-post' } })
        if (badge) {
          const alreadyHas = await prisma.userBadge.findUnique({ where: { userId_badgeId: { userId, badgeId: badge.id } } })
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
