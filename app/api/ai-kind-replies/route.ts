import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getSession } from '@/lib/auth'

// ── AI kind-reply suggestions ───────────────────────────────────────────────
// Three short, warm, one-tap replies for a community post. The hardest part
// of community isn't posting — it's getting the first response.

const FALLBACKS = [
  'That took courage to share 💛',
  'Thank you for putting this into words — you’re not alone.',
  'Sending you strength today 🌿',
]

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ replies: FALLBACKS })

  const apiKey = process.env.GROQ_API_KEY ?? ''
  const { title, body } = await req.json().catch(() => ({}))
  if (!apiKey || (!title && !body)) return NextResponse.json({ replies: FALLBACKS })

  try {
    const groq = new Groq({ apiKey })
    const completion = await groq.chat.completions.create({
      model:       'llama-3.1-8b-instant',
      max_tokens:  160,
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content: `You suggest replies for a wellness community. Given a post, write exactly 3 short supportive replies (each under 15 words, warm, human, specific to the post — never generic praise, never advice unless asked, at most one emoji each). Reply ONLY with the 3 replies, one per line, no numbering.`,
        },
        { role: 'user', content: `Post title: ${String(title ?? '').slice(0, 150)}\nPost: ${String(body ?? '').slice(0, 500)}` },
      ],
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const replies = text.split('\n').map(l => l.replace(/^[\d\-.*)\s]+/, '').trim()).filter(Boolean).slice(0, 3)
    return NextResponse.json({ replies: replies.length === 3 ? replies : FALLBACKS })
  } catch {
    return NextResponse.json({ replies: FALLBACKS })
  }
}
