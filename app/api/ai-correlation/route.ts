import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

function todayStr() { return new Date().toISOString().split('T')[0] }

// Cache key scoped to current month (so insight refreshes monthly)
function monthKey() {
  const d = new Date()
  return `correlation_${d.getFullYear()}_${d.getMonth() + 1}`
}

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const userId = Number(session.user.id)

  // ── Check cache (UserMemory, monthly key) ─────────────────────────────────
  const cacheKey = monthKey()
  const cached = await prisma.userMemory.findUnique({
    where: { userId_key: { userId, key: cacheKey } },
  })
  if (cached?.value) {
    try {
      return NextResponse.json(JSON.parse(cached.value))
    } catch { /* fall through and regenerate */ }
  }

  // ── Fetch 30 days of mood + sleep data ───────────────────────────────────
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)

  const [moods, sleepLogs] = await Promise.all([
    prisma.moodEntry.findMany({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      select: { date: true, mood: true },
    }),
    prisma.sleepLog.findMany({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      select: { date: true, durationMins: true },
    }),
  ])

  // Need at least 5 paired days to show something meaningful
  const moodMap = new Map<string, number>()
  moods.forEach(m => moodMap.set(m.date, m.mood))

  const sleepMap = new Map<string, number>()
  sleepLogs.forEach(l => sleepMap.set(l.date, l.durationMins / 60))

  // Pair by date
  const pairs: { sleep: number; mood: number }[] = []
  sleepMap.forEach((sleepHrs, date) => {
    const mood = moodMap.get(date)
    if (mood !== undefined) pairs.push({ sleep: sleepHrs, mood })
  })

  if (pairs.length < 4) {
    return NextResponse.json({
      hasData: false,
      message: 'Log both mood and sleep for at least 4 days to see your correlation report.',
    })
  }

  // ── Split into good sleep (≥ 7h) vs poor sleep (< 7h) ───────────────────
  const goodSleep = pairs.filter(p => p.sleep >= 7)
  const poorSleep = pairs.filter(p => p.sleep < 7)

  const avgMoodGood = goodSleep.length
    ? goodSleep.reduce((s, p) => s + p.mood, 0) / goodSleep.length
    : null
  const avgMoodPoor = poorSleep.length
    ? poorSleep.reduce((s, p) => s + p.mood, 0) / poorSleep.length
    : null

  const overallSleepAvg = pairs.reduce((s, p) => s + p.sleep, 0) / pairs.length
  const overallMoodAvg  = pairs.reduce((s, p) => s + p.mood,  0) / pairs.length

  const moodDiff = avgMoodGood !== null && avgMoodPoor !== null
    ? avgMoodGood - avgMoodPoor
    : null

  // ── Generate AI insight sentence ──────────────────────────────────────────
  let insight = 'Your mood and sleep patterns show an interesting relationship — keep logging to uncover it fully.'

  if (groq && moodDiff !== null) {
    const context = moodDiff > 0.5
      ? `On days with 7+ hours of sleep, their mood averages ${avgMoodGood?.toFixed(1)}/5 vs ${avgMoodPoor?.toFixed(1)}/5 on shorter-sleep days (${moodDiff.toFixed(1)} point difference).`
      : moodDiff < -0.2
      ? `Interestingly, their mood doesn't drop significantly on lower-sleep days — they average ${avgMoodPoor?.toFixed(1)}/5 vs ${avgMoodGood?.toFixed(1)}/5 on better-sleep days.`
      : `Their mood stays relatively stable (${avgMoodGood?.toFixed(1)} vs ${avgMoodPoor?.toFixed(1)}) regardless of sleep duration.`

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        stream: false,
        max_tokens: 80,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `You write one encouraging, empathetic insight sentence about a user's mood-sleep connection.
Be specific and reference the pattern. Tone: warm, curious, non-clinical.
Length: exactly 1 sentence, under 30 words.`,
          },
          {
            role: 'user',
            content: `Data: ${context} Write one sentence insight.`,
          },
        ],
      })
      const text = completion.choices[0]?.message?.content?.trim()
      if (text) insight = text.replace(/^["']|["']$/g, '')
    } catch (err) {
      console.error('[ai-correlation] Groq error:', err)
    }
  }

  const result = {
    hasData: true,
    pairCount: pairs.length,
    overallSleepAvg: Math.round(overallSleepAvg * 10) / 10,
    overallMoodAvg:  Math.round(overallMoodAvg  * 10) / 10,
    goodSleepCount: goodSleep.length,
    poorSleepCount: poorSleep.length,
    avgMoodGoodSleep: avgMoodGood !== null ? Math.round(avgMoodGood * 10) / 10 : null,
    avgMoodPoorSleep: avgMoodPoor !== null ? Math.round(avgMoodPoor * 10) / 10 : null,
    moodDiff: moodDiff !== null ? Math.round(moodDiff * 10) / 10 : null,
    insight,
  }

  // ── Cache result for the month ────────────────────────────────────────────
  await prisma.userMemory.upsert({
    where:  { userId_key: { userId, key: cacheKey } },
    create: { userId, key: cacheKey, value: JSON.stringify(result), source: 'journal' },
    update: { value: JSON.stringify(result) },
  }).catch(() => {})

  return NextResponse.json(result)
}
