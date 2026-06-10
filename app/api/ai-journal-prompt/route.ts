import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// ── Groq singleton ─────────────────────────────────────────────────────────
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

// Static fallbacks by mood band (used when Groq unavailable or not logged in)
const FALLBACKS = {
  high:    'What made today feel alive — who or what brought that spark?',
  medium:  'What is one thing that kept you steady today, however small?',
  low:     'What is the tiniest kindness — from yourself or someone else — you can hold onto today?',
  neutral: 'What is a detail from today you would like to remember a year from now?',
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

// ── GET /api/ai-journal-prompt ─────────────────────────────────────────────
export async function GET() {
  const session = await getSession()

  // ── Not logged in — return a thoughtful static prompt ───────────────────
  if (!session?.user?.id) {
    return NextResponse.json({ prompt: FALLBACKS.neutral, source: 'static' })
  }

  const userId = Number(session.user.id)
  const today = todayStr()
  const cacheKey = `journal_prompt_${today}`

  // ── 1. Check UserMemory cache ────────────────────────────────────────────
  const cached = await prisma.userMemory.findUnique({
    where: { userId_key: { userId, key: cacheKey } },
  })
  if (cached?.value) {
    return NextResponse.json({ prompt: cached.value, source: 'cached' })
  }

  // ── 2. Fetch mood context ────────────────────────────────────────────────
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000)

  const [todayMood, recentMoods] = await Promise.all([
    prisma.moodEntry.findFirst({
      where: { userId, date: today },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.moodEntry.findMany({
      where: { userId, createdAt: { gte: threeDaysAgo } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ])

  // Determine mood band
  const moodScore = todayMood?.mood
    ?? (recentMoods.length
      ? recentMoods.reduce((s: number, m) => s + m.mood, 0) / recentMoods.length
      : null)

  let moodContext = 'no mood data available'
  let fallback = FALLBACKS.neutral

  if (moodScore !== null) {
    if (moodScore >= 4) {
      moodContext = `feeling great (mood score: ${moodScore.toFixed(1)}/5)`
      fallback = FALLBACKS.high
    } else if (moodScore >= 3) {
      moodContext = `feeling okay (mood score: ${moodScore.toFixed(1)}/5)`
      fallback = FALLBACKS.medium
    } else {
      moodContext = `having a tough time (mood score: ${moodScore.toFixed(1)}/5)`
      fallback = FALLBACKS.low
    }
  }

  // ── 3. Generate prompt via Groq ───────────────────────────────────────────
  let generatedPrompt = fallback

  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        stream: false,
        max_tokens: 60,
        temperature: 0.85,
        messages: [
          {
            role: 'system',
            content: `You write short, thoughtful journal prompts for a wellness app.
Write exactly ONE journal prompt — a single question or gentle invitation to reflect.
The prompt should feel warm, specific, and non-generic.
Match the tone to the user's current mood: ${moodContext}.
Length: 10–20 words. End with a question mark.
Do NOT start with "I", do NOT use "you should", do NOT be preachy.`,
          },
          {
            role: 'user',
            content: `User is ${moodContext}. Write today's journal prompt.`,
          },
        ],
      })
      const text = completion.choices[0]?.message?.content?.trim()
      if (text && text.length > 10) {
        // Clean up: remove surrounding quotes if any
        generatedPrompt = text.replace(/^["']|["']$/g, '')
      }
    } catch (err) {
      console.error('[ai-journal-prompt] Groq error:', err)
    }
  }

  // ── 4. Cache in UserMemory (TTL handled by key date, cleaned lazily) ─────
  await prisma.userMemory.upsert({
    where: { userId_key: { userId, key: cacheKey } },
    create: { userId, key: cacheKey, value: generatedPrompt, source: 'journal' },
    update: { value: generatedPrompt },
  }).catch(() => {}) // Non-critical — don't fail the response

  return NextResponse.json({ prompt: generatedPrompt, source: 'ai' })
}
