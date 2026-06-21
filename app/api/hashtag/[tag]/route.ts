import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tag: string }> },
) {
  const { tag } = await params
  const normalTag = decodeURIComponent(tag).replace(/^#/, '').toLowerCase().trim()
  if (!normalTag) return NextResponse.json({ tag: '', posts: [] })

  const session = await getSession()
  const userId  = session?.user?.id ? Number(session.user.id) : null

  const posts = await prisma.communityPost.findMany({
    where: {
      approved: true,
      OR: [
        { tags: { contains: normalTag } },
        { body: { contains: `#${normalTag}` } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user:   { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } },
      likes:  userId ? { where: { userId }, select: { id: true } } : false,
    },
  })

  return NextResponse.json({
    tag: normalTag,
    count: posts.length,
    posts: posts.map(p => {
      let images: string[] = []
      try { images = JSON.parse(p.images || '[]') } catch { /* noop */ }
      return {
        id:           p.id,
        title:        p.title,
        body:         p.body,
        author:       p.author,
        tags:         p.tags,
        images,
        createdAt:    p.createdAt,
        user:         p.user,
        likeCount:    p._count.likes,
        commentCount: p._count.comments,
        likedByMe:    userId ? (p.likes as { id: number }[]).length > 0 : false,
      }
    }),
  })
}
