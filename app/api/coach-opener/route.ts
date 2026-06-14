import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserLiveContext } from '@/lib/memory'

// ── Proactive coach opener ──────────────────────────────────────────────────
// One warm, contextual first line so the coach greets the user with
// continuity instead of waiting in silence. Static fallbacks if AI is down.

const FALLBACK = "Hi, I'm here. What's on your mind today? 🌿"

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ opener: FALLBACK })
  const userId = Number(session.user.id)

  const apiKey = process.env.GROQ_API_KEY ?? ''
  if (!apiKey) return NextResponse.json({ opener: FALLBACK })

  try {
    const [liveCtx, user] = await Promise.all([
      getUserLiveContext(userId),
      prisma.user.findUnique({
        where:  { id: userId },
        select: { name: true, lastActiveDate: true },
      }),
    ])

    const firstName = user?.name?.split(' ')[0] ?? 'friend'
    const daysAway = user?.lastActiveDate
      ? Math.floor((Date.now() - new Date(user.lastActiveDate).getTime()) / 86400000)
      : null
    const situational = daysAway !== null && daysAway >= 5
      ? `The user is returning after ${daysAway} days away — welcome them back warmly with zero guilt.`
      : ''

    const groq = new Groq({ apiKey })
    const completion = await groq.chat.completions.create({
      model:       'llama-3.1-8b-instant',
      max_tokens:  80,
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content: `You are the Calm Coach on a wellness app, opening a conversation with ${firstName}. Write ONE warm opening message (1-2 short sentences, max 30 words, at most one emoji). Reference their recent context naturally if it helps — an improving week, an active challenge, a streak — but never recite data or sound like surveillance. End with a gentle invitation to talk. ${situational}${liveCtx}`,
        },
        { role: 'user', content: 'Open the conversation.' },
      ],
    })

    const opener = completion.choices[0]?.message?.content?.trim()
    return NextResponse.json({ opener: opener && opener.length > 5 ? opener : FALLBACK })
  } catch {
    return NextResponse.json({ opener: FALLBACK })
  }
}
