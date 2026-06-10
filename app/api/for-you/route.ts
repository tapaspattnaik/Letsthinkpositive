import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getAllArticles } from '@/lib/library'
import { getAllPosts } from '@/lib/posts'

// ── Types ──────────────────────────────────────────────────────────────────
interface Recommendation {
  type:    'article' | 'post'
  slug:    string
  href:    string
  title:   string
  excerpt: string
  badge:   string          // e.g. "For your mood", "Sleep boost"
  emoji:   string
}

// ── Mood → recommended categories ─────────────────────────────────────────
function moodCategories(moodAvg: number | null): string[] {
  if (moodAvg === null) return []
  if (moodAvg <= 2.5)  return ['Anxiety', 'Relaxation', 'Mindfulness', 'Gratitude']
  if (moodAvg <= 3.5)  return ['Mindfulness', 'Movement', 'Gratitude', 'Affirmations']
  return ['Gratitude', 'Movement', 'Habits', 'Affirmations']
}

// ── Score a single content item ────────────────────────────────────────────
function scoreItem(
  tags: string[],
  category: string,
  interests: string[],
  moodCats: string[],
  needsSleep: boolean,
  dateStr: string,
): number {
  let score = 0

  // Interest match (+3 per matching interest vs category, +2 per tag)
  const catLower = category.toLowerCase()
  interests.forEach(i => {
    if (catLower.includes(i.toLowerCase()) || i.toLowerCase().includes(catLower)) score += 3
    tags.forEach(t => {
      if (t.toLowerCase().includes(i.toLowerCase())) score += 2
    })
  })

  // Mood relevance
  if (moodCats.includes(category)) score += 4

  // Sleep relevance
  if (needsSleep && (category === 'Sleep' || tags.includes('Sleep'))) score += 5

  // Recency boost (within 30 days)
  const dayAge = (Date.now() - new Date(dateStr).getTime()) / 86400000
  if (dayAge < 30)  score += 2
  if (dayAge < 60)  score += 1

  return score
}

// ── Badge label ────────────────────────────────────────────────────────────
function badge(category: string, moodAvg: number | null, needsSleep: boolean): string {
  if (needsSleep && category === 'Sleep') return 'Sleep boost'
  if (moodAvg !== null && moodAvg <= 2.5 && ['Anxiety', 'Relaxation', 'Mindfulness'].includes(category))
    return 'For your mood'
  if (category === 'Gratitude') return 'Gratitude practice'
  if (category === 'Movement')  return 'Energy boost'
  if (category === 'Affirmations') return 'Mindset shift'
  return 'Picked for you'
}

const CATEGORY_EMOJI: Record<string, string> = {
  Gratitude: '🙏', Mindfulness: '🧘', Sleep: '🌙', Movement: '👣',
  Anxiety: '💙', Relaxation: '🌿', Affirmations: '⭐', Habits: '✅',
}

// ── GET /api/for-you ───────────────────────────────────────────────────────
export async function GET() {
  const session = await getSession()

  // ── No session — return top featured content ──────────────────────────────
  if (!session?.user?.id) {
    const articles = getAllArticles().filter(a => a.featured).slice(0, 4)
    const recs: Recommendation[] = articles.map(a => ({
      type: 'article', slug: a.slug, href: `/library/${a.slug}`,
      title: a.title, excerpt: a.excerpt,
      badge: 'Popular', emoji: CATEGORY_EMOJI[a.category] ?? '📚',
    }))
    return NextResponse.json({ recs, personalised: false })
  }

  const userId = Number(session.user.id)

  // ── Fetch user context ─────────────────────────────────────────────────────
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000)
  const [user, recentMoods, recentSleep] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: userId },
      select: { interests: true, currentStreak: true },
    }),
    prisma.moodEntry.findMany({
      where:  { userId, createdAt: { gte: threeDaysAgo } },
      select: { mood: true },
      take:   6,
    }),
    prisma.sleepLog.findMany({
      where:  { userId, createdAt: { gte: threeDaysAgo } },
      select: { durationMins: true },
      take:   3,
    }),
  ])

  const interests: string[] = user?.interests
    ? user.interests.split(',').map((s: string) => s.trim()).filter(Boolean)
    : []

  const moodAvg = recentMoods.length
    ? recentMoods.reduce((s: number, m) => s + m.mood, 0) / recentMoods.length
    : null

  const sleepAvg = recentSleep.length
    ? recentSleep.reduce((s: number, l) => s + l.durationMins, 0) / recentSleep.length / 60
    : null

  const needsSleep = sleepAvg !== null && sleepAvg < 6.5
  const moodCats   = moodCategories(moodAvg)

  // ── Score all content ──────────────────────────────────────────────────────
  const articles  = getAllArticles()
  const posts     = getAllPosts()

  interface Scored { score: number; item: Recommendation }
  const candidates: Scored[] = []

  for (const a of articles) {
    const score = scoreItem(a.tags, a.category, interests, moodCats, needsSleep, a.date)
    if (score > 0 || a.featured) {
      candidates.push({
        score: a.featured ? score + 1 : score,
        item: {
          type: 'article', slug: a.slug, href: `/library/${a.slug}`,
          title: a.title, excerpt: a.excerpt,
          badge: badge(a.category, moodAvg, needsSleep),
          emoji: CATEGORY_EMOJI[a.category] ?? '📚',
        },
      })
    }
  }

  for (const p of posts) {
    const tagArr = p.tag ? [p.tag] : []
    const score = scoreItem(tagArr, p.tag ?? '', interests, moodCats, needsSleep, p.date)
    if (score > 0) {
      candidates.push({
        score,
        item: {
          type: 'post', slug: p.slug, href: `/blog/${p.slug}`,
          title: p.title, excerpt: p.excerpt,
          badge: 'From the blog',
          emoji: '✍️',
        },
      })
    }
  }

  // ── Sort by score, deduplicate types, take top 4 ───────────────────────────
  candidates.sort((a, b) => b.score - a.score)

  // Ensure we mix types: max 3 articles + 1 post
  const recs: Recommendation[] = []
  let articleCount = 0
  let postCount    = 0
  for (const c of candidates) {
    if (recs.length >= 4) break
    if (c.item.type === 'article' && articleCount < 3) { recs.push(c.item); articleCount++ }
    if (c.item.type === 'post'    && postCount    < 1) { recs.push(c.item); postCount++    }
  }

  // Fallback: fill remaining with top articles
  if (recs.length < 4) {
    for (const c of candidates) {
      if (recs.length >= 4) break
      if (!recs.find(r => r.slug === c.item.slug)) recs.push(c.item)
    }
  }

  return NextResponse.json({ recs, personalised: true })
}
