import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAllPosts }    from '@/lib/posts'
import { getAllArticles } from '@/lib/library'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') ?? '').trim().toLowerCase()

  if (!q || q.length < 2)
    return NextResponse.json({ blog: [], community: [], library: [] })

  // ── Blog posts (markdown files) ────────────────────────────────────────
  const allPosts = getAllPosts()
  const blog = allPosts
    .filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q)
    )
    .slice(0, 8)
    .map(p => ({
      title:   p.title,
      excerpt: p.excerpt,
      href:    `/blog/${p.slug}`,
      tag:     p.tag,
      date:    p.date,
    }))

  // ── Library articles (markdown files) ─────────────────────────────────
  const allArticles = getAllArticles()
  const library = allArticles
    .filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    )
    .slice(0, 8)
    .map(a => ({
      title:    a.title,
      excerpt:  a.excerpt,
      href:     `/library/${a.slug}`,
      category: a.category,
    }))

  // ── Community posts (DB) ───────────────────────────────────────────────
  const communityRows = await prisma.communityPost.findMany({
    where: {
      approved: true,
      OR: [
        { title: { contains: q } },
        { body:  { contains: q } },
        { tags:  { contains: q } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take:    8,
    select:  { id: true, title: true, body: true, author: true, user: { select: { name: true } } },
  })

  const community = communityRows.map(p => ({
    title:   p.title,
    excerpt: p.body.slice(0, 140) + (p.body.length > 140 ? '…' : ''),
    href:    '/community',
    author:  p.user?.name ?? p.author,
  }))

  return NextResponse.json({ blog, community, library })
}
