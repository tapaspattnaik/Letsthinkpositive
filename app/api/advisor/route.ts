import { NextRequest } from 'next/server'
import Groq from 'groq-sdk'
import { ADVISOR_SYSTEM_PROMPT } from '@/lib/together'
import { withLanguage } from '@/lib/languages'

const encoder = new TextEncoder()
function sseText(text: string) { return encoder.encode(`data: ${JSON.stringify({ text })}\n\n`) }
function sseDone()             { return encoder.encode('data: [DONE]\n\n') }

function fallbackStream(message: string) {
  return new ReadableStream({
    start(c) { c.enqueue(sseText(message)); c.enqueue(sseDone()); c.close() },
  })
}

function makeResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  })
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY ?? ''
  if (!apiKey) {
    return makeResponse(fallbackStream(
      "Bit isn't configured yet — add GROQ_API_KEY to your .env file and restart the server."
    ))
  }

  try {
    const { messages, mood, language } = await req.json()

    const basePrompt = mood
      ? `${ADVISOR_SYSTEM_PROMPT}\n\nThe user's current mood: ${mood}. Tailor your opening tone accordingly.`
      : ADVISOR_SYSTEM_PROMPT
    const systemContent = withLanguage(basePrompt, language)

    const groq = new Groq({ apiKey })

    const groqMessages = [
      { role: 'system' as const, content: systemContent },
      ...(messages || []).map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: m.content,
      })),
    ]

    const stream = await groq.chat.completions.create({
      model:       'llama-3.1-8b-instant',  // fast small model — ideal for 2-4 sentence replies
      messages:    groqMessages,
      max_tokens:  280,
      temperature: 0.7,
      stream:      true,
    })

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) controller.enqueue(sseText(text))
          }
        } catch (e) {
          console.error('Advisor stream error:', e)
          const msg = e instanceof Error ? e.message : String(e)
          const friendly = msg.includes('429') || msg.includes('rate')
            ? "We're getting a lot of love right now — please try again in a moment. 💙"
            : "I lost my train of thought — want to try again?"
          controller.enqueue(sseText(friendly))
        } finally {
          controller.enqueue(sseDone())
          controller.close()
        }
      },
    })

    return makeResponse(readable)
  } catch (err: unknown) {
    console.error('Advisor API error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    const friendly = msg.includes('429') || msg.includes('rate')
      ? "We're getting a lot of love right now — please try again in a moment. 💙"
      : "I'm having a quiet moment — please try again."
    return makeResponse(fallbackStream(friendly))
  }
}
