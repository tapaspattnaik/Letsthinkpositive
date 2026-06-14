import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// ── Semantic search — type how you feel, get routed to what helps ───────────
// A router prompt over the app's destinations: no embeddings infra needed.

const DESTINATIONS = [
  { id: 'breathing',   href: '/breathing',    title: 'Guided Breathing',        icon: '🌬️', desc: 'calm anxiety fast, panic, racing heart, stress relief in minutes' },
  { id: 'sleep',       href: '/sleep',        title: 'Sleep Tracker',           icon: '🌙', desc: 'cannot sleep, insomnia, tired, bedtime, track rest' },
  { id: 'sleep-21',    href: '/challenges',   title: '21-Day Sleep Reset',      icon: '😴', desc: 'fix sleep schedule, build bedtime routine, racing thoughts at night' },
  { id: 'journal',     href: '/journal',      title: 'Gratitude Journal',       icon: '📓', desc: 'write feelings, process thoughts, gratitude practice, vent' },
  { id: 'mood',        href: '/mood',         title: 'Mood Tracker',            icon: '📊', desc: 'track how I feel, mood patterns, emotional check-in' },
  { id: 'coach',       href: '/coach',        title: 'Calm Coach (AI)',         icon: '🌿', desc: 'talk to someone, need support, lonely, overwhelmed, advice' },
  { id: 'reframe',     href: '/reframe',      title: 'Thought Reframe (CBT)',   icon: '🧠', desc: 'negative thoughts, overthinking, self-criticism, spiraling, catastrophizing' },
  { id: 'meditation',  href: '/meditation',   title: 'Meditation',              icon: '🧘', desc: 'mindfulness, quiet the mind, focus, presence' },
  { id: 'sounds',      href: '/sounds',       title: 'Calming Sounds',          icon: '🎧', desc: 'relax, ambient noise, rain sounds, focus music, unwind' },
  { id: 'challenges',  href: '/challenges',   title: 'Wellness Challenges',     icon: '🏆', desc: 'build habits, motivation, structure, 30 day programs' },
  { id: 'community',   href: '/community',    title: 'Community Wall',          icon: '💛', desc: 'feel less alone, share story, connect with others, support' },
  { id: 'gratitude',   href: '/gratitude-wall', title: 'Gratitude Wall',        icon: '🙏', desc: 'feel-good posts, thankfulness, positivity boost' },
  { id: 'affirmation', href: '/affirmation',  title: 'Daily Affirmations',      icon: '💌', desc: 'confidence, self-belief, positive self-talk, morning boost' },
  { id: 'intention',   href: '/intention',    title: 'Daily Intention',         icon: '🌅', desc: 'start the day right, focus word, purpose, morning routine' },
  { id: 'habits',      href: '/habits',       title: 'Habit Tracker',           icon: '🎯', desc: 'consistency, build routines, track daily habits' },
  { id: 'quiz',        href: '/quiz',         title: 'Wellness Quiz',           icon: '🩺', desc: 'assess anxiety, depression check, stress level, self-assessment' },
  { id: 'yoga',        href: '/yoga',         title: 'Yoga',                    icon: '🧘‍♀️', desc: 'gentle movement, stretch, body tension, physical release' },
]

const FALLBACK_IDS = ['coach', 'breathing', 'journal']

export async function POST(req: NextRequest) {
  const { query } = await req.json().catch(() => ({}))
  const q = String(query ?? '').trim().slice(0, 300)
  if (!q) return NextResponse.json({ error: 'Query required.' }, { status: 400 })

  const apiKey = process.env.GROQ_API_KEY ?? ''
  const byId = Object.fromEntries(DESTINATIONS.map(d => [d.id, d]))

  let ids: string[] = FALLBACK_IDS
  let note = ''

  if (apiKey) {
    try {
      const groq = new Groq({ apiKey })
      const completion = await groq.chat.completions.create({
        model:       'llama-3.1-8b-instant',
        max_tokens:  120,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You route a wellness-app user to what helps. Destinations:\n${DESTINATIONS.map(d => `${d.id}: ${d.title} — ${d.desc}`).join('\n')}\n\nGiven how the user feels, pick the 3 best destination ids (most helpful first) and write one short warm sentence (max 18 words) acknowledging them. JSON only: {"ids":["id1","id2","id3"],"note":"<sentence>"}`,
          },
          { role: 'user', content: q },
        ],
      })
      const parsed = JSON.parse(completion.choices[0]?.message?.content ?? '{}')
      if (Array.isArray(parsed.ids)) {
        const valid = parsed.ids.filter((i: unknown) => typeof i === 'string' && byId[i])
        if (valid.length) ids = valid.slice(0, 3)
      }
      if (typeof parsed.note === 'string') note = parsed.note.slice(0, 160)
    } catch { /* fall back */ }
  }

  return NextResponse.json({
    note: note || 'Here are a few places that might help right now:',
    results: ids.map(i => byId[i]),
  })
}
