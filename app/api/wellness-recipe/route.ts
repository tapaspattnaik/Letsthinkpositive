import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface RecipeTool { slug: string; label: string; emoji: string; href: string; reason: string }

const TODAY = () => new Date().toISOString().slice(0, 10)

function getTimeSlot(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

// Rule-based personalised recipe — no AI needed, instant response
function buildRecipe(moodAvg: number | null, sleepHrs: number | null, streakDays: number, timeSlot: string): RecipeTool[] {
  const tools: RecipeTool[] = []

  // Morning always starts with intention-setting
  if (timeSlot === 'morning') {
    tools.push({ slug: 'intention', label: 'Morning Intention', emoji: '🌅', href: '/intention', reason: 'Set a positive focus for your day' })
  }

  // Low mood → coach + breathing
  if (moodAvg !== null && moodAvg <= 2.5) {
    tools.push({ slug: 'breathing', label: 'Breathing Exercise', emoji: '🌬️', href: '/breathing', reason: 'Your mood has been low — a few mindful breaths can help' })
    tools.push({ slug: 'coach',     label: 'Calm Coach',         emoji: '🌿', href: '/coach',    reason: 'Talk it through with your AI wellness companion' })
  }
  // Good mood → gratitude + journal
  else if (moodAvg !== null && moodAvg >= 4) {
    tools.push({ slug: 'journal',       label: 'Gratitude Journal', emoji: '📓', href: '/journal',       reason: 'You\'re in a great place — capture this feeling' })
    tools.push({ slug: 'gratitude-wall',label: 'Gratitude Wall',    emoji: '🙏', href: '/gratitude-wall', reason: 'Share your positivity with the community' })
  }
  // Neutral mood
  else {
    tools.push({ slug: 'mood', label: 'Mood Check-in', emoji: '📊', href: '/mood', reason: 'Log how you\'re feeling to spot patterns over time' })
  }

  // Poor sleep → meditation + sounds
  if (sleepHrs !== null && sleepHrs < 6) {
    tools.push({ slug: 'meditation', label: 'Guided Meditation', emoji: '🧘', href: '/meditation', reason: `You slept ${sleepHrs.toFixed(1)}h — a short session helps recovery` })
    tools.push({ slug: 'sounds',     label: 'Calm Sounds',       emoji: '🎧', href: '/sounds',    reason: 'Ambient sounds help restore mental energy' })
  }

  // Evening wind-down
  if (timeSlot === 'evening') {
    tools.push({ slug: 'sleep',     label: 'Sleep Tracker', emoji: '🌙', href: '/sleep',     reason: 'Log tonight\'s sleep to build your pattern' })
    tools.push({ slug: 'reframe',   label: 'Thought Reframer', emoji: '🧠', href: '/reframe', reason: 'End the day with a clearer mind' })
  }

  // Streak building — suggest habits or challenges
  if (streakDays > 0 && streakDays < 7) {
    tools.push({ slug: 'habits', label: 'Habit Tracker', emoji: '🎯', href: '/habits', reason: `You\'re on a ${streakDays}-day streak — keep it going!` })
  } else if (streakDays === 0) {
    tools.push({ slug: 'challenges', label: 'Take a Challenge', emoji: '🏆', href: '/challenges', reason: 'Start a 7-day challenge to build momentum' })
  }

  // Default fallbacks if under 3 tools
  const defaults: RecipeTool[] = [
    { slug: 'affirmation', label: 'Daily Affirmation', emoji: '💌', href: '/affirmation', reason: 'Start with a positive intention' },
    { slug: 'journal',     label: 'Journal',           emoji: '📓', href: '/journal',     reason: 'A few minutes of reflection goes a long way' },
    { slug: 'breathing',   label: 'Breathing',         emoji: '🌬️', href: '/breathing',   reason: 'Ground yourself with mindful breathing' },
  ]

  for (const d of defaults) {
    if (tools.length >= 3) break
    if (!tools.find(t => t.slug === d.slug)) tools.push(d)
  }

  // Deduplicate and return exactly 3
  const seen = new Set<string>()
  return tools.filter(t => { if (seen.has(t.slug)) return false; seen.add(t.slug); return true }).slice(0, 3)
}

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ recipe: null })

  const userId = Number(session.user.id)
  const today  = TODAY()

  // Return cached recipe if already generated today
  const cached = await prisma.dailyRecipe.findUnique({ where: { userId_date: { userId, date: today } } })
  if (cached) {
    let tools: RecipeTool[]
    try {
      const raw = JSON.parse(cached.tools)
      // Old cache format stored slug strings; new format stores full objects.
      // Guard against the old format by checking whether the first item is an object.
      if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object' && raw[0]?.href) {
        tools = raw as RecipeTool[]
      } else {
        // Legacy slug-only format — rebuild recipe so the response always has full objects
        const [user2, recentMoods2, lastSleep2] = await Promise.all([
          prisma.user.findUnique({ where: { id: userId }, select: { currentStreak: true } }),
          prisma.moodEntry.findMany({
            where: { userId, createdAt: { gte: new Date(Date.now() - 3 * 86400000) } },
            orderBy: { createdAt: 'desc' },
            take: 5,
          }),
          prisma.sleepLog.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        ])
        const moodAvg2  = recentMoods2.length ? recentMoods2.reduce((s, m) => s + m.mood, 0) / recentMoods2.length : null
        const sleepHrs2 = lastSleep2 ? lastSleep2.durationMins / 60 : null
        tools = buildRecipe(moodAvg2, sleepHrs2, user2?.currentStreak ?? 0, getTimeSlot())
        // Upgrade the cache entry to the new format so future reads are fast
        await prisma.dailyRecipe.update({
          where: { userId_date: { userId, date: today } },
          data:  { tools: JSON.stringify(tools), reasons: JSON.stringify(tools.map(t => t.reason)) },
        }).catch(() => {})
      }
    } catch {
      tools = []
    }
    return NextResponse.json({
      recipe: { tools, reasons: tools.map(t => t.reason), date: cached.date },
    })
  }

  // Gather user data for personalisation
  const [user, recentMoods, lastSleep] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { currentStreak: true, name: true } }),
    prisma.moodEntry.findMany({
      where: { userId, createdAt: { gte: new Date(Date.now() - 3 * 86400000) } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.sleepLog.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const moodAvg   = recentMoods.length ? recentMoods.reduce((s, m) => s + m.mood, 0) / recentMoods.length : null
  const sleepHrs  = lastSleep ? lastSleep.durationMins / 60 : null
  const streak    = user?.currentStreak ?? 0
  const timeSlot  = getTimeSlot()

  const recipe    = buildRecipe(moodAvg, sleepHrs, streak, timeSlot)

  // Cache it — store full tool objects so the read path always gets complete data
  await prisma.dailyRecipe.upsert({
    where:  { userId_date: { userId, date: today } },
    create: {
      userId, date: today,
      tools:   JSON.stringify(recipe),              // full objects with href/label/emoji
      reasons: JSON.stringify(recipe.map(t => t.reason)),
      moodScore:  moodAvg,
      sleepHours: sleepHrs,
    },
    update: {},
  })

  return NextResponse.json({ recipe: { tools: recipe, reasons: recipe.map(t => t.reason), date: today } })
}
