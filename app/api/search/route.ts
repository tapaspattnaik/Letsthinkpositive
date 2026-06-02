import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAllPosts }    from '@/lib/posts'
import { getAllArticles } from '@/lib/library'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q    = (searchParams.get('q') ?? '').trim().toLowerCase()
  const type = searchParams.get('type') ?? 'all'

  if (!q || q.length < 2)
    return NextResponse.json({ blog: [], community: [], library: [], users: [], circles: [], userPosts: [] })

  const inc = (t: string) => type === 'all' || type === t

  // ── 1. Users ───────────────────────────────────────────────────────────
  const users = inc('users') ? await prisma.user.findMany({
    where: {
      OR: [
        { name:  { contains: q } },
        { bio:   { contains: q } },
        { interests: { contains: q } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: {
      id: true, name: true, avatarUrl: true, bio: true, interests: true, createdAt: true,
      _count: { select: { badges: true, progress: true } },
    },
  }).then(rows => rows.map(u => ({
    id:        u.id,
    name:      u.name,
    avatar:    u.avatarUrl,
    bio:       u.bio,
    interests: u.interests ? u.interests.split(',').filter(Boolean).slice(0, 4) : [],
    badges:    u._count.badges,
    joined:    u.createdAt.toISOString().slice(0, 10),
    href:      `/profile/${u.id}`,
  }))) : []

  // ── 2. Circles ─────────────────────────────────────────────────────────
  const circles = inc('circles') ? await prisma.circle.findMany({
    where: {
      OR: [
        { name:        { contains: q } },
        { description: { contains: q } },
      ],
    },
    take: 8,
    include: { _count: { select: { members: true, posts: true } } },
  }).then(rows => rows.map(c => ({
    id: c.id, name: c.name, slug: c.slug,
    description: c.description, icon: c.icon,
    members: c._count.members, posts: c._count.posts,
    href: `/circles/${c.slug}`,
  }))) : []

  // ── 3. Blog — filesystem ───────────────────────────────────────────────
  const blog = inc('blog') ? getAllPosts()
    .filter(p =>
      p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q)   || p.author.toLowerCase().includes(q)
    ).slice(0, 8)
    .map(p => ({ title: p.title, excerpt: p.excerpt, href: `/blog/${p.slug}`, tag: p.tag, date: p.date, author: p.author }))
    : []

  // ── 4. User-submitted approved blog posts ──────────────────────────────
  const userPosts = inc('blog') ? await prisma.userBlogPost.findMany({
    where: {
      status: 'approved',
      OR: [
        { title:    { contains: q } },
        { excerpt:  { contains: q } },
        { category: { contains: q } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: {
      slug: true, title: true, excerpt: true, category: true, createdAt: true,
      user: { select: { name: true, avatarUrl: true } },
    },
  }).then(rows => rows.map(p => ({
    title: p.title, excerpt: p.excerpt ?? '', href: `/blog/${p.slug}`,
    tag: p.category, date: p.createdAt.toISOString().slice(0, 10),
    author: p.user?.name ?? 'Community', avatar: p.user?.avatarUrl,
  }))) : []

  // ── 5. Community posts ─────────────────────────────────────────────────
  const community = inc('community') ? await prisma.communityPost.findMany({
    where: {
      approved: true,
      OR: [
        { title:  { contains: q } },
        { body:   { contains: q } },
        { author: { contains: q } },
        { tags:   { contains: q } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: {
      id: true, title: true, body: true, author: true, tags: true, createdAt: true,
      user: { select: { name: true, avatarUrl: true } },
      _count: { select: { likes: true } },
    },
  }).then(rows => rows.map(p => ({
    title:   p.title,
    excerpt: p.body.replace(/<[^>]+>/g, '').slice(0, 160) + '…',
    href: '/community', author: p.user?.name ?? p.author,
    avatar: p.user?.avatarUrl, likes: p._count.likes,
    tags: p.tags ? p.tags.split(',').filter(Boolean).slice(0, 3) : [],
  }))) : []

  // ── 6. Library ─────────────────────────────────────────────────────────
  const library = inc('library') ? getAllArticles()
    .filter((a: { title: string; excerpt: string; category: string; tags: string[]; slug: string }) =>
      a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) || a.tags.some((t: string) => t.toLowerCase().includes(q))
    ).slice(0, 8)
    .map((a: { title: string; excerpt: string; category: string; slug: string }) => ({
      title: a.title, excerpt: a.excerpt, href: `/library/${a.slug}`, category: a.category,
    })) : []

  return NextResponse.json({ blog, userPosts, community, library, users, circles })
}
