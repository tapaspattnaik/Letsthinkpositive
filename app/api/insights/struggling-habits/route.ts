import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/db'
import { getSession }   from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Lite alternatives for common habit types (matched by keywords in habit name/emoji)
const LITE_SUGGESTIONS: { keywords: string[]; lite: string; emoji: string }[] = [
  { keywords: ['meditat', 'mindful'],                 lite: '2 minutes of mindful breathing',       emoji: '🧘' },
  { keywords: ['journal', 'write', 'diary'],          lite: 'Write just one sentence today',         emoji: '📓' },
  { keywords: ['run', 'walk', 'exercise', 'gym'],     lite: 'A 5-minute walk outside',               emoji: '🚶' },
  { keywords: ['gratit', 'grateful', 'thankful'],     lite: 'Name one good thing right now',         emoji: '🙏' },
  { keywords: ['water', 'hydrat', 'drink'],           lite: 'Drink one glass of water now',          emoji: '💧' },
  { keywords: ['sleep', 'bed', 'rest'],               lite: 'Put your phone down 10 min earlier',    emoji: '🌙' },
  { keywords: ['read', 'book', 'study', 'learn'],     lite: 'Read one paragraph of anything',        emoji: '📖' },
  { keywords: ['yoga', 'stretch'],                    lite: '3 stretches — just 90 seconds',         emoji: '🧘‍♀️' },
  { keywords: ['no sugar', 'diet', 'eat', 'food'],   lite: 'Swap one snack for a healthy option',   emoji: '🥗' },
]

function getLite(habitName: string, habitEmoji: string): { lite: string; emoji: string } {
  const lower = habitName.toLowerCase()
  for (const s of LITE_SUGGESTIONS) {
    if (s.keywords.some(k => lower.includes(k) || habitEmoji === s.emoji)) {
      return { lite: s.lite, emoji: s.emoji }
    }
  }
  return { lite: 'Try a smaller version of this — even 2 minutes counts', emoji: '✨' }
}

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json([])
  const userId = Number(session.user.id)

  const since = new Date(Date.now() - 7 * 86400000)

  // Get all active habits
  const habits = await prisma.habit.findMany({
    where:   { userId, active: true },
    include: { logs: { where: { createdAt: { gte: since } }, select: { date: true } } },
  })

  if (!habits.length) return NextResponse.json([])

  // Count how many days in the last 7 each habit was logged
  const sevenDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return d.toISOString().slice(0, 10)
  })

  const struggling = habits
    .map(h => {
      const { lite, emoji: liteEmoji } = getLite(h.name, h.emoji)
      return {
        id:     h.id,
        name:   h.name,
        emoji:  h.emoji,
        logged: h.logs.filter(l => sevenDays.includes(l.date)).length,
        lite,
        liteEmoji,
      }
    })
    .filter(h => h.logged <= 2) // missed 5+ of the last 7 days
    .slice(0, 3)

  return NextResponse.json(struggling)
}
