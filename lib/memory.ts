import { prisma } from '@/lib/db'

// Fetch user memories and format them as a context block for AI system prompts
export async function getUserMemoryContext(userId: number): Promise<string> {
  try {
    const memories = await prisma.userMemory.findMany({
      where:   { userId },
      orderBy: { updatedAt: 'desc' },
      take:    10,
    })

    if (!memories.length) return ''

    const lines = memories.map(m => {
      const label = m.key.replace(/_/g, ' ')
      return `- ${label}: ${m.value}`
    })

    return `\n\n[Personalisation context — things this user has previously shared]:\n${lines.join('\n')}\nUse this context naturally to personalise your responses. Don't explicitly mention that you "remember" unless it feels natural.`
  } catch {
    return ''
  }
}

const CHALLENGE_NAMES: Record<string, string> = {
  'gratitude-30':    '30-Day Gratitude',
  'mindfulness-7':   '7-Day Mindfulness',
  'movement-7':      '7 Days of Movement',
  'sleep-21':        '21-Day Sleep Reset',
  'affirmations-21': '21-Day Affirmations',
  'journal-14':      '14-Day Gratitude Journaling',
}

// Live wellbeing context — recent mood trend, streak, active challenge, latest
// gratitude — so the AI companion opens with continuity, not a blank slate.
// Respects the `ai_personalisation` opt-out memory key.
export async function getUserLiveContext(userId: number): Promise<string> {
  try {
    // Opt-out check
    const optOut = await prisma.userMemory.findUnique({
      where: { userId_key: { userId, key: 'ai_personalisation' } },
    })
    if (optOut?.value === 'off') return ''

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)
    const [moods, user, activeChallenges, lastGratitude] = await Promise.all([
      prisma.moodEntry.findMany({
        where:   { userId, createdAt: { gte: sevenDaysAgo } },
        select:  { mood: true, note: true },
        orderBy: { createdAt: 'desc' },
        take:    7,
      }),
      prisma.user.findUnique({
        where:  { id: userId },
        select: { currentStreak: true },
      }),
      prisma.challengeProgress.findMany({
        where:   { userId, completedAt: null },
        select:  { challengeSlug: true },
        take:    2,
      }),
      prisma.gratitudeEntry.findFirst({
        where:   { userId },
        select:  { content: true, date: true },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const lines: string[] = []

    if (moods.length >= 2) {
      const avg = moods.reduce((s, m) => s + m.mood, 0) / moods.length
      const recent = moods.slice(0, 3).reduce((s, m) => s + m.mood, 0) / Math.min(3, moods.length)
      const older  = moods.slice(3).length
        ? moods.slice(3).reduce((s, m) => s + m.mood, 0) / moods.slice(3).length
        : recent
      const direction = recent - older > 0.4 ? 'improving' : older - recent > 0.4 ? 'dipping' : 'steady'
      lines.push(`- mood this week: averaging ${avg.toFixed(1)}/5, trend ${direction}`)
      const lastNote = moods.find(m => m.note)?.note
      if (lastNote) lines.push(`- their latest mood note: "${lastNote.slice(0, 120)}"`)
    }

    if ((user?.currentStreak ?? 0) > 1) {
      lines.push(`- on a ${user!.currentStreak}-day wellness streak`)
    }

    for (const c of activeChallenges) {
      const name = CHALLENGE_NAMES[c.challengeSlug] ?? c.challengeSlug
      lines.push(`- currently doing the ${name} challenge`)
    }

    if (lastGratitude) {
      lines.push(`- most recent gratitude (${lastGratitude.date}): "${lastGratitude.content.slice(0, 120)}"`)
    }

    if (!lines.length) return ''

    return `\n\n[Live wellbeing context — the user's recent activity in the app]:\n${lines.join('\n')}\nWeave this in gently when relevant (e.g. acknowledge an improving week, encourage an active challenge). Never recite it as a list or make the user feel surveilled.`
  } catch {
    return ''
  }
}
