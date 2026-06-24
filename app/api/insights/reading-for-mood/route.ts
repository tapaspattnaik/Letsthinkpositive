import { NextRequest, NextResponse } from 'next/server'
import { getAllArticles } from '@/lib/library'

export const dynamic = 'force-dynamic'

// Keywords mapped to each mood level (1=very low … 5=great)
const MOOD_KEYWORDS: Record<number, string[]> = {
  1: ['anxiety', 'depression', 'crisis', 'overwhelm', 'panic', 'stress', 'grief', 'sadness', 'low', 'dark', 'hopeless'],
  2: ['stress', 'worry', 'fatigue', 'burnout', 'exhaust', 'lonely', 'difficult', 'struggle', 'tired'],
  3: ['balance', 'mindful', 'calm', 'wellbeing', 'routine', 'focus', 'self-care', 'habit'],
  4: ['motivation', 'growth', 'positiv', 'energy', 'confidence', 'purpose', 'gratitude', 'achieve'],
  5: ['gratitude', 'thriving', 'joy', 'inspir', 'flourish', 'resilience', 'goals', 'success', 'meaning'],
}

export async function GET(req: NextRequest) {
  const mood = Number(req.nextUrl.searchParams.get('mood') ?? '3')
  if (mood < 1 || mood > 5) return NextResponse.json([])

  const keywords = [...(MOOD_KEYWORDS[mood] ?? []), ...(MOOD_KEYWORDS[Math.max(1, mood - 1)] ?? [])]

  type Article = { title: string; excerpt: string; category: string; tags: string[]; slug: string }
  const all: Article[] = getAllArticles() as Article[]

  const scored = all.map(a => {
    const text = `${a.title} ${a.excerpt} ${a.category} ${(a.tags ?? []).join(' ')}`.toLowerCase()
    const score = keywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0)
    return { ...a, score }
  }).filter(a => a.score > 0).sort((a, b) => b.score - a.score).slice(0, 3)

  return NextResponse.json(scored.map(a => ({
    title:    a.title,
    excerpt:  a.excerpt,
    category: a.category,
    href:     `/library/${a.slug}`,
  })))
}
