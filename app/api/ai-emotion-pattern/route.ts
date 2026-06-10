/**
 * GET /api/ai-emotion-pattern
 * Returns a 1-sentence AI observation about the user's emotional mood trends
 * from DB mood entries (last 30 days). Cached monthly in UserMemory.
 */

import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

function monthKey() {
  const d = new Date()
  return `emotion_pattern_${d.getFullYear()}_${d.getMonth() + 1}`
}

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ insight: null })
  }
  const userId = Number(session.user.id)
  const cacheKey = monthKey()

  // Check cache
  const cached = await prisma.userMemory.findUnique({
    where: { userId_key: { userId, key: cacheKey } },
  })
  if (cached?.value) return NextResponse.json({ insight: cached.value })

  // Fetch last 30 days of mood data
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
  const moods = await prisma.moodEntry.findMany({
    where:  { userId, createdAt: { gte: thirtyDaysAgo } },
    select: { mood: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  if (moods.length < 3) {
    return NextResponse.json({ insight: null })
  }

  // Compute trend: compare first half vs second half average
  const midpoint = Math.floor(moods.length / 2)
  const firstHalf  = moods.slice(0, midpoint)
  const secondHalf = moods.slice(midpoint)

  const avg = (arr: typeof moods) =>
    arr.reduce((s: number, m) => s + m.mood, 0) / arr.length

  const avgFirst  = avg(firstHalf)
  const avgSecond = avg(secondHalf)
  const overall   = avg(moods)
  const trend     = avgSecond - avgFirst

  // Find most common mood score
  const counts = [0, 0, 0, 0, 0, 0] // index 0 unused; 1-5
  moods.forEach(m => { if (m.mood >= 1 && m.mood <= 5) counts[m.mood]++ })
  const peakMood = counts.indexOf(Math.max(...counts.slice(1)))

  const trendLabel = trend > 0.4
    ? 'improving trend'
    : trend < -0.4
    ? 'declining trend'
    : 'stable pattern'

  let insight = `Your mood has been ${overall >= 3.5 ? 'mostly positive' : 'mixed'} this month — keep logging to see deeper patterns emerge.`

  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        stream: false,
        max_tokens: 60,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'Write one warm, specific sentence about a user\'s emotional mood pattern this month. Be empathetic and encouraging. Under 25 words.',
          },
          {
            role: 'user',
            content: `Data: ${moods.length} mood logs, overall average ${overall.toFixed(1)}/5, most common score ${peakMood}/5, showing a ${trendLabel} over the month.`,
          },
        ],
      })
      const text = completion.choices[0]?.message?.content?.trim()
      if (text) insight = text.replace(/^["']|["']$/g, '')
    } catch { /* fallback already set */ }
  }

  // Cache monthly
  await prisma.userMemory.upsert({
    where:  { userId_key: { userId, key: cacheKey } },
    create: { userId, key: cacheKey, value: insight, source: 'journal' },
    update: { value: insight },
  }).catch(() => {})

  return NextResponse.json({ insight })
}
