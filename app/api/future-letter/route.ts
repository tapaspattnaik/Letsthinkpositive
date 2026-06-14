import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Groq from 'groq-sdk'

// ── Letter from your future self ────────────────────────────────────────────
// Generates a warm, personal letter using the user's recent mood + journal activity.
// Cached in UserMemory for 30 days so it doesn't re-generate on every visit.

const CACHE_KEY = 'future_letter'
const CACHE_DAYS = 30

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const userId = Number(session.user.id)

  try {
    // Check cache
    const cached = await prisma.userMemory.findUnique({
      where: { userId_key: { userId, key: CACHE_KEY } },
    })
    if (cached) {
      const ageDays = (Date.now() - cached.updatedAt.getTime()) / 86400000
      if (ageDays < CACHE_DAYS) {
        return NextResponse.json({ letter: cached.value, cached: true })
      }
    }

    // Gather context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true, currentStreak: true, longestStreak: true, interests: true,
        moodEntries: {
          orderBy: { createdAt: 'desc' }, take: 14,
          select: { mood: true, note: true, createdAt: true },
        },
        progress: {
          where: { completedAt: { not: null } },
          select: { challengeSlug: true },
          take: 5,
        },
        _count: { select: { badges: true } },
      },
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const avgMood = user.moodEntries.length
      ? (user.moodEntries.reduce((s, m) => s + m.mood, 0) / user.moodEntries.length).toFixed(1)
      : null

    const moodSummary = avgMood
      ? `Average mood over last 14 days: ${avgMood}/5. Recent notes: ${user.moodEntries.filter(m => m.note).slice(0, 3).map(m => `"${m.note}"`).join(', ')}.`
      : 'No recent mood data.'

    const completedChallenges = user.progress.map(p => p.challengeSlug.replace(/-/g, ' ')).join(', ') || 'none yet'
    const interests = user.interests || 'wellness, positivity'

    const apiKey = process.env.GROQ_API_KEY ?? ''
    if (!apiKey) return NextResponse.json({ error: 'AI unavailable' }, { status: 503 })

    const groq = new Groq({ apiKey })
    const res = await groq.chat.completions.create({
      model:       'llama-3.1-8b-instant',
      max_tokens:  600,
      temperature: 0.85,
      messages: [
        {
          role: 'system',
          content: `You write a short, warm, personal letter from the user's future self — one year from now — looking back with pride, compassion, and encouragement.
Tone: warm, intimate, first-person (from the future self, addressed as "you"). Not generic. Grounded in their real data.
Length: 5–7 paragraphs. No sign-off line needed.
Do NOT use placeholder brackets. Write naturally.`,
        },
        {
          role: 'user',
          content: `Name: ${user.name}
Interests: ${interests}
Current streak: ${user.currentStreak} days (longest ever: ${user.longestStreak})
Badges earned: ${user._count.badges}
Completed challenges: ${completedChallenges}
${moodSummary}

Write the letter now.`,
        },
      ],
    })

    const letter = res.choices[0]?.message?.content?.trim() ?? ''
    if (!letter) return NextResponse.json({ error: 'Generation failed' }, { status: 500 })

    // Cache it
    await prisma.userMemory.upsert({
      where:  { userId_key: { userId, key: CACHE_KEY } },
      create: { userId, key: CACHE_KEY, value: letter },
      update: { value: letter },
    })

    return NextResponse.json({ letter, cached: false })
  } catch (err) {
    console.error('future-letter error', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// Force regeneration
export async function DELETE() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const userId = Number(session.user.id)
  try {
    await prisma.userMemory.deleteMany({ where: { userId, key: CACHE_KEY } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
