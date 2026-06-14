import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getSession } from '@/lib/auth'

// ── Voice journal transcript tidy ───────────────────────────────────────────
// Cleans a raw speech-to-text transcript into a readable journal entry and
// suggests a mood tag. Falls back to the raw transcript untouched.

const MOODS = ['🌟 Grateful', '😌 Calm', '🌱 Hopeful', '💪 Strong', '😔 Struggling', '🌈 Joyful']

export async function POST(req: NextRequest) {
  const session = await getSession()
  const { transcript } = await req.json().catch(() => ({}))
  const raw = String(transcript ?? '').trim()
  if (!raw) return NextResponse.json({ error: 'No transcript.' }, { status: 400 })
  if (!session?.user?.id) return NextResponse.json({ text: raw, mood: null })

  const apiKey = process.env.GROQ_API_KEY ?? ''
  if (!apiKey || raw.length < 10) return NextResponse.json({ text: raw, mood: null })

  try {
    const groq = new Groq({ apiKey })
    const completion = await groq.chat.completions.create({
      model:       'llama-3.1-8b-instant',
      max_tokens:  400,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You tidy spoken journal entries. Fix punctuation and remove filler words (um, uh, like, you know) but PRESERVE the person's own words, voice and meaning — do not rephrase, embellish, or add anything. Then pick the single best-fitting mood from this exact list: ${MOODS.join(', ')}.
Respond with JSON only: {"text": "<tidied entry>", "mood": "<one mood from the list>"}`,
        },
        { role: 'user', content: raw.slice(0, 2000) },
      ],
    })

    const parsed = JSON.parse(completion.choices[0]?.message?.content ?? '{}')
    const text = typeof parsed.text === 'string' && parsed.text.trim() ? parsed.text.trim() : raw
    const mood = MOODS.includes(parsed.mood) ? parsed.mood : null
    return NextResponse.json({ text, mood })
  } catch {
    return NextResponse.json({ text: raw, mood: null })
  }
}
