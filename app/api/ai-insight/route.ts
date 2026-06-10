import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// ── ISO Week helper ────────────────────────────────────────────────────────
// Returns e.g. "2025-W22"
function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7          // Mon=1 … Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)  // Set to nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

// ── Groq singleton ─────────────────────────────────────────────────────────
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

// ── GET /api/ai-insight ────────────────────────────────────────────────────
export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const userId = Number(session.user.id)
  const currentWeek = getISOWeek(new Date())

  // ── 1. Return cached insight if it exists for this week ──────────────────
  const cached = await prisma.weeklyInsight.findUnique({
    where: { userId_week: { userId, week: currentWeek } },
  })
  if (cached) {
    return NextResponse.json({
      insight: cached.insight,
      moodAvg: cached.moodAvg,
      sleepAvg: cached.sleepAvg,
      streakDays: cached.streakDays,
      habitRate: cached.habitRate,
      week: cached.week,
      isNew: false,
    })
  }

  // ── 2. Gather last-7-day data ─────────────────────────────────────────────
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)

  const [user, moods, sleepLogs, habitLogs, activeHabits] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true },
    }),
    prisma.moodEntry.findMany({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: 'desc' },
      take: 14,
    }),
    prisma.sleepLog.findMany({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: 'desc' },
      take: 7,
    }),
    prisma.habitLog.findMany({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.habit.findMany({
      where: { userId, active: true },
      select: { id: true },
    }),
  ])

  // ── 3. Compute averages ───────────────────────────────────────────────────
  const moodAvg = moods.length
    ? Math.round((moods.reduce((s: number, m) => s + m.mood, 0) / moods.length) * 10) / 10
    : null

  const sleepAvg = sleepLogs.length
    ? Math.round((sleepLogs.reduce((s: number, l) => s + l.durationMins, 0) / sleepLogs.length / 60) * 10) / 10
    : null

  const streakDays = user?.currentStreak ?? 0

  // habitRate = logs completed / (active habits × 7 days). Clamp 0-1.
  const habitRate = activeHabits.length > 0
    ? Math.min(1, habitLogs.length / (activeHabits.length * 7))
    : null

  // ── 4. Build prompt context ───────────────────────────────────────────────
  const moodLabel = moodAvg === null ? 'no mood data this week'
    : moodAvg >= 4 ? `a strong mood average of ${moodAvg}/5`
    : moodAvg >= 3 ? `a moderate mood average of ${moodAvg}/5`
    : `a low mood average of ${moodAvg}/5`

  const sleepLabel = sleepAvg === null ? 'no sleep data recorded'
    : sleepAvg >= 7.5 ? `excellent sleep averaging ${sleepAvg}h`
    : sleepAvg >= 6 ? `decent sleep averaging ${sleepAvg}h`
    : `limited sleep averaging ${sleepAvg}h`

  const streakLabel = streakDays > 0
    ? `a ${streakDays}-day wellness streak`
    : 'no active streak yet'

  const habitLabel = habitRate === null ? 'no habits tracked yet'
    : habitRate >= 0.8 ? `excellent habit consistency at ${Math.round(habitRate * 100)}%`
    : habitRate >= 0.5 ? `moderate habit consistency at ${Math.round(habitRate * 100)}%`
    : `low habit consistency at ${Math.round(habitRate * 100)}%`

  const systemPrompt = `You are a warm, insightful wellness coach writing a brief personalised weekly reflection for a user of letsthinkpositive.com.

Write exactly 3 sentences:
1. Acknowledge their week based on the data — be specific and empathetic.
2. Highlight one genuine strength or positive pattern you notice.
3. Offer one gentle, actionable nudge for next week.

Tone: warm, encouraging, non-clinical, like a caring friend who pays attention.
Length: 3 sentences only, under 120 words total.
Do NOT use their username or "you" in an awkward way. Do NOT mention the app by name. Do NOT use bullet points.`

  const userPrompt = `This week's data: ${moodLabel}, ${sleepLabel}, ${streakLabel}, and ${habitLabel}. Write their weekly insight.`

  // ── 5. Call Groq ──────────────────────────────────────────────────────────
  let insight = 'You showed up this week — and that matters more than any number. Every small action you took was a step towards the person you are becoming. Next week, pick one habit and give it your full attention for just three days.'

  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        stream: false,
        max_tokens: 180,
        temperature: 0.72,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      })
      const text = completion.choices[0]?.message?.content?.trim()
      if (text) insight = text
    } catch (err) {
      console.error('[ai-insight] Groq error:', err)
      // fallback insight already set above
    }
  }

  // ── 6. Cache in DB ────────────────────────────────────────────────────────
  await prisma.weeklyInsight.upsert({
    where: { userId_week: { userId, week: currentWeek } },
    create: {
      userId,
      week: currentWeek,
      insight,
      moodAvg,
      sleepAvg,
      streakDays,
      habitRate,
    },
    update: {
      insight,
      moodAvg,
      sleepAvg,
      streakDays,
      habitRate,
    },
  })

  return NextResponse.json({
    insight,
    moodAvg,
    sleepAvg,
    streakDays,
    habitRate,
    week: currentWeek,
    isNew: true,
  })
}
