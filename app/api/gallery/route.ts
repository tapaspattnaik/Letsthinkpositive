import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET — fetch all approved gallery posts
export async function GET() {
  try {
    const session = await getSession()
    const userId  = session?.user?.id ? Number(session.user.id) : null

    const posts = await prisma.galleryPost.findMany({
      where:   { approved: true },
      orderBy: { createdAt: 'desc' },
      take:    100,
      include: {
        user:   { select: { id: true, name: true, avatarUrl: true } },
        hearts: userId ? { where: { userId }, select: { id: true } } : false,
        _count: { select: { hearts: true } },
      },
    })

    return NextResponse.json(posts.map(p => ({
      id:          p.id,
      title:       p.title,
      description: p.description,
      imageUrl:    p.imageUrl,
      category:    p.category,
      createdAt:   p.createdAt,
      user:        p.user,
      heartCount:  p._count.hearts,
      heartedByMe: userId ? (p.hearts as { id: number }[]).length > 0 : false,
    })))
  } catch (err) {
    console.error('Gallery GET error:', err)
    return NextResponse.json([], { status: 500 })
  }
}

// POST — submit a new gallery post
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id)
      return NextResponse.json({ error: 'Sign in to post.' }, { status: 401 })

    const { title, description, imageUrl, category } = await req.json()

    if (!title?.trim())    return NextResponse.json({ error: 'Title required.' },     { status: 400 })
    if (!imageUrl?.trim()) return NextResponse.json({ error: 'Image required.' },     { status: 400 })
    if (!category?.trim()) return NextResponse.json({ error: 'Category required.' },  { status: 400 })

    const post = await prisma.galleryPost.create({
      data: {
        userId:      Number(session.user.id),
        title:       title.trim().slice(0, 200),
        description: description?.trim().slice(0, 1000) ?? null,
        imageUrl:    imageUrl.trim(),
        category:    category.trim(),
        approved:    true,
      },
      include: {
        user:   { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { hearts: true } },
      },
    })

    return NextResponse.json({
      id:          post.id,
      title:       post.title,
      description: post.description,
      imageUrl:    post.imageUrl,
      category:    post.category,
      createdAt:   post.createdAt,
      user:        post.user,
      heartCount:  0,
      heartedByMe: false,
    })
  } catch (err) {
    console.error('Gallery POST error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
