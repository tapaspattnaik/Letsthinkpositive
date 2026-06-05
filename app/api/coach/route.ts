import { NextRequest } from 'next/server'
import Groq from 'groq-sdk'
import { withLanguage } from '@/lib/languages'
import { getUserMemoryContext } from '@/lib/memory'
import { getSession } from '@/lib/auth'

const COACH_SYSTEM_PROMPT = `You are the Calm Coach — a warm, encouraging wellness companion on letsthinkpositive.com.

Your role:
- Provide gentle, validating, and encouraging support
- Ask thoughtful follow-up questions to help users reflect and gain insight
- Offer practical, grounded suggestions when appropriate
- Focus on emotional wellbeing, mindfulness, gratitude, movement, sleep, and positive habits
- Never diagnose, prescribe, or replace professional mental health support

Your tone is:
- Warm and conversational, like a trusted friend
- Non-judgmental and deeply compassionate
- Curious and reflective — you listen more than you advise
- Hopeful and grounding — you help people find calm in uncertainty

Response style:
- Keep responses focused and not overwhelming (3-5 sentences typically)
- Validate feelings before offering suggestions
- Use the user's own words and language
- End with a gentle question or invitation to reflect further when appropriate

Remember: You are a wellness guide, not a therapist. If someone expresses crisis-level distress, gently encourage them to reach out to a professional or helpline.`

// Module-level singleton
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

const encoder = new TextEncoder()

function sseText(text: string) {
  return encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
}
function sseDone() {
  return encoder.encode('data: [DONE]\n\n')
}

function fallbackSSE(msg: string) {
  return new Response(
    new ReadableStream({
      start(c) {
        c.enqueue(sseText(msg))
        c.enqueue(sseDone())
        c.close()
      },
    }),
    { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } }
  )
}

export async function POST(req: NextRequest) {
  if (!groq) {
    return fallbackSSE("The Calm Coach isn't configured yet — GROQ_API_KEY is missing from the server environment.")
  }

  try {
    const { messages, category, language } = await req.json()
    if (!messages?.length) {
      return new Response('Messages required', { status: 400 })
    }

    // Inject personalisation memories into the system prompt
    const session      = await getSession()
    const memoryCtx    = session?.user?.id ? await getUserMemoryContext(Number(session.user.id)) : ''

    const basePrompt = [
      COACH_SYSTEM_PROMPT,
      category ? `The user has selected focus area: ${category}. Tailor your responses to this theme.` : '',
      memoryCtx,
    ].filter(Boolean).join('\n\n')
    const systemContent = withLanguage(basePrompt, language)

    // Use 8b-instant for most topics (higher rate limit, sub-200ms first token)
    // Only use 70B for deep reflection/wisdom topics where nuance matters more
    const deepCategories = ['reflection', 'calm']
    const model = deepCategories.includes(category) ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant'

    const groqMessages = [
      { role: 'system' as const, content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: m.content,
      })),
    ]

    const abort     = new AbortController()
    const timeoutId = setTimeout(() => abort.abort(), 60_000)

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = await groq.chat.completions.create({
            model,
            messages:    groqMessages,
            max_tokens:  800,
            temperature: 0.75,
            stream:      true,
          })

          for await (const chunk of stream) {
            if (abort.signal.aborted) break
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) controller.enqueue(sseText(text))
          }
        } catch (streamErr) {
          console.error('Coach stream error:', streamErr)
          const msg = streamErr instanceof Error ? streamErr.message : String(streamErr)
          const friendly = msg.includes('API_KEY') || msg.includes('api_key') || msg.includes('invalid')
            ? "The AI key isn't configured correctly — please add GROQ_API_KEY to the server environment."
            : msg.includes('429') || msg.includes('rate') || msg.includes('quota')
            ? "We're a little busy right now — please try again in a moment. 💙"
            : "I'm sorry, I couldn't connect just now. Please try again in a moment. 🌿"
          controller.enqueue(sseText(friendly))
        } finally {
          clearTimeout(timeoutId)
          controller.enqueue(sseDone())
          controller.close()
        }
      },
      cancel() {
        clearTimeout(timeoutId)
        abort.abort()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type':      'text/event-stream',
        'Cache-Control':     'no-cache',
        'Connection':        'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('Coach API error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    const friendly = msg.includes('429') || msg.includes('rate')
      ? "We're a little busy right now — please try again in a moment. 💙"
      : "I'm sorry, I couldn't connect just now. Please try again in a moment. 🌿"
    return fallbackSSE(friendly)
  }
}
