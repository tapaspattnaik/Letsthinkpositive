import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Groq from 'groq-sdk'

// GET — fetch all memories for this user (for profile + system prompt injection)
export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ memories: [] })

  const memories = await prisma.userMemory.findMany({
    where:   { userId: Number(session.user.id) },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ memories })
}

// DELETE — remove a single memory by id
export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await req.json()
  await prisma.userMemory.deleteMany({
    where: { id: Number(id), userId: Number(session.user.id) },
  })

  return NextResponse.json({ success: true })
}

// POST — extract + store memories from a completed conversation
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { messages, source = 'coach' } = await req.json()
  if (!messages?.length || messages.length < 2) return NextResponse.json({ saved: 0 })

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return NextResponse.json({ saved: 0 })

  try {
    const groq = new Groq({ apiKey })

    // Build a concise transcript for extraction
    const transcript = messages
      .filter((m: { role: string; content: string }) => m.role === 'user')
      .map((m: { role: string; content: string }) => m.content)
      .join('\n')
      .slice(0, 2000)

    const completion = await groq.chat.completions.create({
      model:       'llama-3.1-8b-instant',
      temperature: 0,
      max_tokens:  300,
      stream:      false,
      messages: [
        {
          role: 'system',
          content: `You are a memory extraction assistant. From the user's messages in a wellness coaching conversation, extract up to 5 meaningful facts to remember about them.

Return ONLY a valid JSON array. Each item: {"key": "short_key", "value": "what to remember"}

Key naming rules — use these exact keys when applicable:
- "main_goal" — their primary wellness goal
- "main_struggle" — their biggest challenge
- "name_pref" — what they like to be called
- "life_context" — job, family, life situation
- "what_helps" — things that help them
- "mood_pattern" — recurring mood patterns
- "motivation_style" — what motivates them
- For anything else, use a descriptive snake_case key.

Only extract facts that are clearly stated. Return [] if nothing significant.
DO NOT include generic observations. Only personal facts.`,
        },
        { role: 'user', content: `User messages:\n${transcript}` },
      ],
    })

    const raw   = completion.choices[0]?.message?.content?.trim() ?? '[]'
    const match = raw.match(/\[[\s\S]*\]/)
    if (!match) return NextResponse.json({ saved: 0 })

    const facts = JSON.parse(match[0]) as { key: string; value: string }[]
    if (!Array.isArray(facts) || facts.length === 0) return NextResponse.json({ saved: 0 })

    const userId = Number(session.user.id)
    let saved = 0

    for (const fact of facts.slice(0, 5)) {
      if (!fact.key || !fact.value) continue
      await prisma.userMemory.upsert({
        where:  { userId_key: { userId, key: fact.key } },
        create: { userId, key: fact.key, value: fact.value, source },
        update: { value: fact.value, source, updatedAt: new Date() },
      })
      saved++
    }

    return NextResponse.json({ saved })
  } catch (err) {
    console.error('Memory extraction error:', err)
    return NextResponse.json({ saved: 0 })
  }
}
