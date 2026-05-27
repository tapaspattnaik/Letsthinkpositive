import { NextRequest } from 'next/server'
import Together from 'together-ai'
import { ADVISOR_SYSTEM_PROMPT } from '@/lib/together'

const encoder = new TextEncoder()

function sseText(text: string) {
  return encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
}
function sseDone() {
  return encoder.encode('data: [DONE]\n\n')
}

/** Stream a plain-text fallback so the widget shows something helpful */
function fallbackStream(message: string) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(sseText(message))
      controller.enqueue(sseDone())
      controller.close()
    },
  })
}

function makeResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}

export async function POST(req: NextRequest) {
  // ── Guard: API key must be present ─────────────────────────
  const apiKey = process.env.TOGETHER_API_KEY ?? ''
  if (!apiKey) {
    return makeResponse(
      fallbackStream(
        "Bit isn't configured yet — the AI key is missing. " +
        "Add TOGETHER_API_KEY to your .env file and restart the server."
      )
    )
  }

  try {
    const { messages, mood } = await req.json()

    const systemPrompt = mood
      ? `${ADVISOR_SYSTEM_PROMPT}\n\nThe user's current mood: ${mood}. Tailor your opening tone accordingly.`
      : ADVISOR_SYSTEM_PROMPT

    const together = new Together({ apiKey })

    const stream = await together.chat.completions.create({
      model:       'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      messages:    [{ role: 'system', content: systemPrompt }, ...messages],
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
          controller.enqueue(sseDone())
        } catch (streamErr) {
          console.error('Advisor stream error:', streamErr)
          controller.enqueue(
            sseText("I lost my train of thought there — want to try again?")
          )
          controller.enqueue(sseDone())
        } finally {
          controller.close()
        }
      },
    })

    return makeResponse(readable)

  } catch (err: unknown) {
    console.error('Advisor API error:', err)

    // Distinguish common errors so the widget message is helpful
    const msg = err instanceof Error ? err.message : String(err)

    let friendly =
      "I'm having a quiet moment — something didn't connect. Please try again."

    if (msg.includes('401') || msg.includes('Authentication') || msg.includes('API key')) {
      friendly = "Bit's AI key seems invalid. Check TOGETHER_API_KEY in your .env."
    } else if (msg.includes('429') || msg.includes('rate')) {
      friendly = "We're getting a lot of love right now — please try again in a moment. 💙"
    } else if (msg.includes('model') || msg.includes('404')) {
      friendly = "The AI model isn't available right now. Try again shortly."
    }

    return makeResponse(fallbackStream(friendly))
  }
}
