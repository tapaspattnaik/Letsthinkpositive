import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminUser } from '@/lib/admin'

/** Returns the ISO week string for today, e.g. "2025-W21" */
function currentISOWeek(): string {
  const now = new Date()
  // ISO week: Thursday-based week number
  const jan1 = new Date(now.getFullYear(), 0, 1)
  // day of week: 0=Sun…6=Sat → shift so Mon=0
  const dayOfWeek = (now.getDay() + 6) % 7
  const jan1DayOfWeek = (jan1.getDay() + 6) % 7
  // Week number
  const weekNum = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1DayOfWeek + 1) / 7)
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}


// GET — return current week's featured story
export async function GET() {
  const week = currentISOWeek()

  const [community, blog] = await Promise.all([
    prisma.communityPost.findFirst({
      where: { featuredWeek: week, approved: true },
      select: {
        id: true, title: true, body: true, author: true,
        createdAt: true, userId: true,
        user: { select: { name: true, avatarUrl: true } },
      },
    }),
    prisma.userBlogPost.findFirst({
      where: { featuredWeek: week, status: 'approved' },
      select: {
        id: true, title: true, excerpt: true, body: true, slug: true,
        createdAt: true, userId: true,
        user: { select: { name: true, avatarUrl: true } },
      },
    }),
  ])

  if (community) {
    return NextResponse.json({ story: community, type: 'community' })
  }
  if (blog) {
    return NextResponse.json({ story: blog, type: 'blog' })
  }
  return NextResponse.json({ story: null, type: null })
}

// POST — set the featured story for this week
export async function POST(req: NextRequest) {
  if (!await getAdminUser()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { postId, postType } = body as { postId: number; postType: 'community' | 'blog' }

  if (!postId || !postType) {
    return NextResponse.json({ error: 'postId and postType are required' }, { status: 400 })
  }

  const week = currentISOWeek()

  if (postType === 'community') {
    // Clear any previous community feature this week
    await prisma.communityPost.updateMany({
      where: { featuredWeek: week },
      data: { featuredWeek: null },
    })
    const post = await prisma.communityPost.update({
      where: { id: Number(postId) },
      data: { featuredWeek: week },
      select: { id: true, title: true },
    })
    return NextResponse.json({ ok: true, featured: post, week })
  }

  if (postType === 'blog') {
    // Clear any previous blog feature this week
    await prisma.userBlogPost.updateMany({
      where: { featuredWeek: week },
      data: { featuredWeek: null },
    })
    const post = await prisma.userBlogPost.update({
      where: { id: Number(postId) },
      data: { featuredWeek: week },
      select: { id: true, title: true },
    })
    return NextResponse.json({ ok: true, featured: post, week })
  }

  return NextResponse.json({ error: 'Invalid postType' }, { status: 400 })
}
