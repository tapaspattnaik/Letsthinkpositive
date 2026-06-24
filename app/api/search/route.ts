import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession }    from '@/lib/auth'
import { getAllPosts }    from '@/lib/posts'
import { getAllArticles } from '@/lib/library'

export const dynamic = 'force-dynamic'

// All tool/page destinations — searchable by everyone
const TOOLS = [
  { title: 'Guided Breathing',        href: '/breathing',      icon: '🌬️', desc: 'Calm anxiety fast, stress relief, breathing exercises, panic, racing heart' },
  { title: 'Sleep Tracker',           href: '/sleep',          icon: '🌙', desc: 'Cannot sleep, insomnia, tired, bedtime tracker, rest, sleep quality' },
  { title: 'Gratitude Journal',       href: '/journal',        icon: '📓', desc: 'Write feelings, journaling, gratitude practice, vent, daily diary' },
  { title: 'Mood Tracker',            href: '/mood',           icon: '📊', desc: 'Track how I feel, mood patterns, emotional check-in, feelings log' },
  { title: 'Calm Coach (AI)',         href: '/coach',          icon: '🌿', desc: 'Talk to someone, AI support, need help, lonely, overwhelmed, advice' },
  { title: 'Thought Reframer (CBT)',  href: '/reframe',        icon: '🧠', desc: 'Negative thoughts, overthinking, self-criticism, spiraling, CBT therapy' },
  { title: 'Meditation',              href: '/meditation',     icon: '🧘', desc: 'Mindfulness, guided meditation, quiet the mind, focus, presence, calm' },
  { title: 'Calming Sounds',          href: '/sounds',         icon: '🎧', desc: 'Relax, ambient noise, rain sounds, focus music, unwind, white noise' },
  { title: 'Wellness Challenges',     href: '/challenges',     icon: '🏆', desc: 'Build habits, motivation, 21-day sleep reset, 30-day programmes, routines' },
  { title: 'Community Wall',          href: '/community',      icon: '💛', desc: 'Share story, connect with others, support, community, social, posts' },
  { title: 'Gratitude Wall',          href: '/gratitude-wall', icon: '🙏', desc: 'Thankfulness, positivity, feel-good posts, grateful, share gratitude' },
  { title: 'Daily Affirmations',      href: '/affirmation',    icon: '💌', desc: 'Confidence, self-belief, positive self-talk, morning boost, affirmation card' },
  { title: 'Habit Tracker',           href: '/habits',         icon: '🎯', desc: 'Consistency, build routines, track daily habits, goals, streaks' },
  { title: 'Yoga Guide',              href: '/yoga',           icon: '🧘‍♀️', desc: 'Gentle movement, stretch, body tension, yoga poses, physical release' },
  { title: 'Water Tracker',           href: '/water',          icon: '💧', desc: 'Hydration, water intake, daily water goals, drink water reminder' },
  { title: 'Wellness Quiz',           href: '/quiz',           icon: '🩺', desc: 'Assess anxiety, depression check, stress level, self-assessment, mental health test' },
  { title: 'Positive Eating',         href: '/positive-eating', icon: '🥗', desc: 'Food, mood, nutrition, healthy eating, diet, wellbeing through food' },
  { title: 'Foods for Happiness',     href: '/happy-foods',    icon: '😊', desc: 'Eat your way to joy, happy foods, mood food, brain food, nutrition for happiness' },
  { title: 'Daily Intention',         href: '/intention',      icon: '🌅', desc: 'Start the day right, focus word, purpose, morning routine, set intention' },
  { title: 'Wellness Calendar',       href: '/calendar',       icon: '📅', desc: 'Your wellness journey, day by day, calendar view, track wellness' },
  { title: 'Wellness Snapshot',       href: '/snapshot',       icon: '📈', desc: '7-day summary, weekly review, wellbeing overview, progress snapshot' },
  { title: 'Birthday Card Maker',     href: '/birthday-card',  icon: '🎂', desc: 'Birthday wish, make a card, celebrate, greeting for a friend' },
  { title: 'Quote Creator',           href: '/quotes',         icon: '🎨', desc: 'Shareable quote card, inspirational quotes, social media card' },
  { title: 'Vision Board',            href: '/vision-board',   icon: '⭐', desc: 'Visualise your goals, dream board, vision, aspirations, future self' },
  { title: 'Positive Drawing',        href: '/drawing',        icon: '✏️', desc: 'Zentangle, mandala, art therapy, mindful drawing, creative calm' },
  { title: 'Habits Lab',              href: '/habits-lab',     icon: '⚡', desc: 'Habit science, habit stacking, behavior design, habit formation' },
  { title: 'Wisdom Coaching',         href: '/wisdom-coaching', icon: '👴', desc: 'Life guidance, purpose, wisdom, life coaching, meaning, direction' },
  { title: 'Self-Assessments',        href: '/assessments',    icon: '🧠', desc: 'PHQ-9, stress assessment, resilience, mental health screening, GAD-7' },
  { title: 'Kindness Map',            href: '/kindness-map',   icon: '🗺️', desc: 'See kindness spread worldwide, acts of kindness, global kindness map' },
  { title: 'Kids Zone',               href: '/kids',           icon: '🌈', desc: 'For children, kids activities, young learners, family wellness' },
  { title: 'Good News',               href: '/good-news',      icon: '🌍', desc: 'Uplifting news, positive stories, good things happening, feel-good news' },
  { title: 'Daily Feed',              href: '/feed',           icon: '✨', desc: 'Daily quotes, inspiration, motivational content, daily dose of positivity' },
  { title: 'Blog',                    href: '/blog',           icon: '✍️', desc: 'Stories, insights, articles, wellness writing, mental health blog' },
  { title: 'Library',                 href: '/library',        icon: '📚', desc: 'Wellness articles, guides, mental health resources, educational content' },
  { title: 'Circles',                 href: '/circles',        icon: '🔒', desc: 'Private group spaces, wellness groups, support circles, community groups' },
  { title: 'My Tribe',                href: '/tribe',          icon: '🌿', desc: 'Your connections, social feed, friends, followers, wellness network' },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q    = (searchParams.get('q') ?? '').trim().toLowerCase()
  const type = searchParams.get('type') ?? 'all'

  if (!q || q.length < 2)
    return NextResponse.json({ blog: [], community: [], library: [], users: [], circles: [], userPosts: [], tools: [], restricted: false })

  const session    = await getSession()
  const isLoggedIn = !!session?.user?.id

  const inc    = (t: string) => type === 'all' || type === t
  const social = (t: string) => isLoggedIn && inc(t)

  // ── 0. Tools & pages (always, everyone) ───────────────────────────────────
  const tools = inc('tools') ? TOOLS.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.desc.toLowerCase().includes(q)
  ).slice(0, 6) : []

  // ── 1. Users (logged-in only) ──────────────────────────────────────────
  const users = social('users') ? await prisma.user.findMany({
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

  // ── 2. Circles (logged-in only) ────────────────────────────────────────
  const circles = social('circles') ? await prisma.circle.findMany({
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

  // ── 5. Community posts (logged-in only) ────────────────────────────────
  const community = social('community') ? await prisma.communityPost.findMany({
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

  return NextResponse.json({ blog, userPosts, community, library, users, circles, tools, restricted: !isLoggedIn })
}
