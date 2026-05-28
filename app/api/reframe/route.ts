import { NextRequest } from 'next/server'
import Together from 'together-ai'

const encoder = new TextEncoder()

function sseText(text: string) {
  return encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
}
function sseDone() {
  return encoder.encode('data: [DONE]\n\n')
}

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

const REFRAME_SYSTEM_PROMPT = `You are a compassionate CBT (Cognitive Behavioural Therapy) coach on letsthinkpositive.com.

When the user shares a negative, anxious, or distorted thought, respond in this exact structure:

**Feeling acknowledged:** One warm sentence validating what they feel (never dismissive).
**What's happening here:** Identify the cognitive distortion in plain words (e.g., "This sounds like all-or-nothing thinking" or "catastrophising"). One sentence.
**A more balanced view:** 2–3 sentences offering a realistic, grounded reframe using CBT techniques. Honest — not toxic positivity.
**One question to sit with:** A single gentle Socratic question to help them explore the thought further.

Total response: under 160 words. Never clinical. Never preachy. Warm and honest.`

export async function POST(req: NextRequest) {
  const apiKey = process.env.TOGETHER_API_KEY ?? ''
  if (!apiKey) {
    return makeResponse(
      fallbackStream(
        "The AI key is missing — add TOGETHER_API_KEY to your .env file and restart the server."
      )
    )
  }

  try {
    const { thought } = await req.json()

    if (!thought || typeof thought !== 'string' || !thought.trim()) {
      return makeResponse(fallbackStream("Please share a thought to reframe."))
    }

    const together = new Together({ apiKey })

    const stream = await together.chat.completions.create({
      model:       'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      messages:    [
        { role: 'system',  content: REFRAME_SYSTEM_PROMPT },
        { role: 'user',    content: thought.trim() },
      ],
      max_tokens:  320,
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
          console.error('Reframe stream error:', streamErr)
          controller.enqueue(
            sseText("Something went quiet mid-stream — want to try again?")
          )
          controller.enqueue(sseDone())
        } finally {
          controller.close()
        }
      },
    })

    return makeResponse(readable)

  } catch (err: unknown) {
    console.error('Reframe API error:', err)

    const msg = err instanceof Error ? err.message : String(err)
    let friendly = "Something didn't connect just now. Please try again."

    if (msg.includes('401') || msg.includes('Authentication') || msg.includes('API key')) {
      friendly = "The AI key seems invalid. Check TOGETHER_API_KEY in your .env."
    } else if (msg.includes('429') || msg.includes('rate')) {
      friendly = "We're a little busy right now — please try again in a moment."
    } else if (msg.includes('model') || msg.includes('404')) {
      friendly = "The AI model isn't available right now. Try again shortly."
    }

    return makeResponse(fallbackStream(friendly))
  }
}
