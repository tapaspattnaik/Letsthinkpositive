import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// ── AI Birthday Message generator ───────────────────────────────────────────
// Public tool (no auth). Generates a warm, personal birthday message from a few
// inputs. Falls back to a curated pool if Groq is unavailable.

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

const TONES = ['heartfelt', 'funny', 'inspirational', 'poetic', 'short & sweet'] as const
type Tone = (typeof TONES)[number]

const FALLBACKS: Record<string, string[]> = {
  heartfelt: [
    'Happy Birthday! May this year bring you all the joy, love, and quiet moments of peace you so deeply deserve. You make the world brighter just by being in it.',
    'Wishing you a birthday as wonderful as the warmth you bring to everyone around you. Here\'s to another year of beautiful memories.',
  ],
  funny: [
    'Happy Birthday! Don\'t worry about the candles — at this point the cake is basically a small bonfire. Enjoy every delicious second of it!',
    'Another year older, another year wiser… or at least another year of pretending you have it all figured out. Have a fantastic birthday!',
  ],
  inspirational: [
    'Happy Birthday! May this new year be a fresh page — full of brave beginnings, bold dreams, and the quiet confidence that you are exactly where you need to be.',
    'Here\'s to a year of growth, courage, and chasing what sets your soul on fire. The best chapters of your story are still ahead. Happy Birthday!',
  ],
  poetic: [
    'Another candle, another year, / another chance to hold what\'s dear. / May your path be soft, your laughter bright — / Happy Birthday, and a year of light.',
    'May your day bloom like morning light, / gentle, golden, warm and bright. / Happy Birthday — may joy stay near, / and follow you throughout the year.',
  ],
  'short & sweet': [
    'Happy Birthday! Wishing you a day full of joy and a year full of blessings. 🎂',
    'Cheers to you today! May your birthday be as lovely as you are. 🎉',
  ],
}

function fallbackFor(tone: string): string {
  const pool = FALLBACKS[tone] ?? FALLBACKS.heartfelt
  return pool[Math.floor(Math.random() * pool.length)]
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const recipientName = String(body.recipientName ?? '').trim().slice(0, 60)
  const relationship  = String(body.relationship ?? '').trim().slice(0, 40)
  const toneRaw       = String(body.tone ?? 'heartfelt').toLowerCase()
  const tone: Tone    = (TONES as readonly string[]).includes(toneRaw) ? (toneRaw as Tone) : 'heartfelt'
  const age           = body.age ? String(body.age).replace(/\D/g, '').slice(0, 3) : ''
  const traits        = String(body.traits ?? '').trim().slice(0, 200)

  if (!groq) {
    return NextResponse.json({ message: fallbackFor(tone), personalised: false })
  }

  try {
    const details = [
      recipientName ? `Name: ${recipientName}` : 'Name: not given',
      relationship  ? `Relationship to sender: ${relationship}` : '',
      age           ? `Turning: ${age}` : '',
      traits        ? `Things to mention: ${traits}` : '',
    ].filter(Boolean).join('\n')

    const completion = await groq.chat.completions.create({
      model:       'llama-3.1-8b-instant',
      stream:      false,
      max_tokens:  220,
      temperature: 0.9,
      messages: [
        {
          role: 'system',
          content: `You write warm, personal birthday card messages.
Write exactly ONE birthday message in a "${tone}" tone.
Rules:
- Address the recipient by name naturally if a name is given.
- 2–4 sentences (or a short 4-line verse if the tone is poetic).
- Genuine and specific, never generic or clichéd. Weave in any details provided.
- Do NOT add a signature, "From", quotation marks, or labels — just the message text.
- Keep it appropriate and kind.`,
        },
        {
          role: 'user',
          content: `Write a ${tone} birthday message.\n${details}`,
        },
      ],
    })

    let message = completion.choices[0]?.message?.content?.trim() ?? ''
    message = message.replace(/^["']|["']$/g, '').trim()
    if (message.length < 12) message = fallbackFor(tone)

    return NextResponse.json({ message, personalised: true })
  } catch {
    return NextResponse.json({ message: fallbackFor(tone), personalised: false })
  }
}
