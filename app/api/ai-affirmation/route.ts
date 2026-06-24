/**
 * GET /api/ai-affirmation
 * Returns a daily personalised affirmation based on mood + streak.
 * Cached in UserMemory (key: affirmation_YYYY-MM-DD) — one Groq call per user per day.
 */

import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

// Static fallback pool (used when unauthenticated or Groq fails)
const FALLBACKS = [
  'You are stronger than yesterday, and braver than you know.',
  'Every small step you take is proof of your commitment to yourself.',
  'You are allowed to take up space. You are allowed to matter.',
  'Your calm is your superpower. Breathe. You\'ve got this.',
  'Today is another chance to begin again — and that is a gift.',
  'You are doing better than you think. Keep going.',
  'The care you show others — give some to yourself today.',
]

function todayStr() { return new Date().toISOString().split('T')[0] }

export async function GET() {
  const session = await getSession()

  if (!session?.user?.id) {
    const idx = new Date().getDate() % FALLBACKS.length
    return NextResponse.json({ affirmation: FALLBACKS[idx], personalised: false })
  }

  const userId = Number(session.user.id)
  const today  = todayStr()
  const cacheKey = `affirmation_v2_${today}`

  // Check cache
  const cached = await prisma.userMemory.findUnique({
    where: { userId_key: { userId, key: cacheKey } },
  })
  if (cached?.value) {
    return NextResponse.json({ affirmation: cached.value, personalised: true })
  }

  // Fetch context
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000)
  const [user, recentMoods] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: userId },
      select: { currentStreak: true, name: true },
    }),
    prisma.moodEntry.findMany({
      where:  { userId, createdAt: { gte: threeDaysAgo } },
      select: { mood: true },
      take:   6,
    }),
  ])

  const moodAvg = recentMoods.length
    ? recentMoods.reduce((s: number, m) => s + m.mood, 0) / recentMoods.length
    : null

  const streak = user?.currentStreak ?? 0

  // Fetch richer profile context for personalisation
  const profile = await prisma.user.findUnique({
    where:  { id: userId },
    select: { name: true, primaryGoal: true, lifeStage: true, interests: true },
  })

  const name      = profile?.name?.split(' ')[0] ?? ''
  const goalCtx   = profile?.primaryGoal ? `Their primary wellness goal is: ${profile.primaryGoal}.` : ''
  const stageCtx  = profile?.lifeStage   ? `They are at life stage: ${profile.lifeStage}.`           : ''
  const topInterest = profile?.interests?.split(',').filter(Boolean)[0] ?? ''
  const interestCtx = topInterest ? `One of their key interests is: ${topInterest}.` : ''

  // Build context description
  const moodCtx = moodAvg === null ? 'no recent mood data'
    : moodAvg >= 4 ? 'feeling great lately'
    : moodAvg >= 3 ? 'doing okay'
    : 'having a tough time'

  const streakCtx = streak > 0
    ? `on a ${streak}-day wellness streak`
    : 'just starting their wellness journey'

  let affirmation = FALLBACKS[new Date().getDate() % FALLBACKS.length]

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
            content: `You write short, powerful daily affirmations for a wellness app.
Write exactly ONE affirmation — a single sentence of encouragement.
Tone: warm, personal, empowering. Not generic or clichéd.
Length: 10–20 words. Vary the opening phrase — do not always start with "I am".
Use the user's first name naturally if it fits. Mirror their goal and interests.`,
          },
          {
            role: 'user',
            content: [
              name         ? `User's name: ${name}.`            : '',
              goalCtx, stageCtx, interestCtx,
              `They are ${moodCtx} and ${streakCtx}.`,
              'Write their affirmation for today.',
            ].filter(Boolean).join(' '),
          },
        ],
      })
      const text = completion.choices[0]?.message?.content?.trim()
      if (text && text.length > 8) {
        affirmation = text.replace(/^["']|["']$/g, '')
      }
    } catch { /* fallback already set */ }
  }

  // Cache for today
  await prisma.userMemory.upsert({
    where:  { userId_key: { userId, key: cacheKey } },
    create: { userId, key: cacheKey, value: affirmation, source: 'affirmation' },
    update: { value: affirmation },
  }).catch(() => {})

  return NextResponse.json({ affirmation, personalised: true })
}
