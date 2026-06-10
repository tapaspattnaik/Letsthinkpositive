import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getSession } from '@/lib/auth'

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

export interface GeneratedChallenge {
  emoji:       string
  title:       string
  description: string
  dailyAction: string
  outcome:     string
  duration:    string
  totalDays:   number
}

const FALLBACK: GeneratedChallenge = {
  emoji:       '🌱',
  title:       'Your Personal 21-Day Growth Challenge',
  description: 'A bespoke daily habit built around your unique goal. Each day is a small, intentional act that compounds into lasting change.',
  dailyAction: 'Spend 10 minutes on your goal — reflect, act, and record one observation in your journal.',
  outcome:     'A new habit that aligns with what matters most to you.',
  duration:    '21 Days',
  totalDays:   21,
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const goal = (body.goal as string | undefined)?.trim()

  if (!goal || goal.length < 5) {
    return NextResponse.json({ error: 'Please describe your goal.' }, { status: 400 })
  }

  if (!groq) {
    return NextResponse.json({ challenge: FALLBACK })
  }

  const systemPrompt = `You are a wellness coach creating personalised 21-day challenges for a mental wellbeing app.

Given a user's goal, create a custom challenge. Respond with ONLY valid JSON (no markdown, no prose), matching this exact structure:
{
  "emoji":       "<single relevant emoji>",
  "title":       "<challenge title, max 8 words>",
  "description": "<2-3 sentence description of the challenge>",
  "dailyAction": "<specific daily action, 1 sentence, max 20 words>",
  "outcome":     "<expected outcome, 1 sentence>",
  "duration":    "21 Days",
  "totalDays":   21
}

Rules:
- Keep it achievable and kind, never harsh
- Daily action must be concrete and specific (not generic like "be better")
- Emoji must relate to the goal`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      stream: false,
      max_tokens: 300,
      temperature: 0.75,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: `My goal: ${goal}` },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim() ?? ''

    // Parse JSON — strip any surrounding markdown code block if present
    const jsonStr = raw.replace(/^```(?:json)?\n?|\n?```$/g, '').trim()
    const parsed = JSON.parse(jsonStr) as GeneratedChallenge

    // Validate required fields
    if (!parsed.title || !parsed.description || !parsed.dailyAction) {
      return NextResponse.json({ challenge: FALLBACK })
    }

    // Ensure totalDays is numeric
    parsed.totalDays = Number(parsed.totalDays) || 21
    parsed.duration  = parsed.duration || '21 Days'

    return NextResponse.json({ challenge: parsed })
  } catch (err) {
    console.error('[ai-challenge] error:', err)
    return NextResponse.json({ challenge: FALLBACK })
  }
}
