import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

const REFRAME_SYSTEM_PROMPT = `You are a compassionate CBT (Cognitive Behavioural Therapy) coach on letsthinkpositive.com.

When the user shares a negative, anxious, or distorted thought, respond in this exact structure:

**Feeling acknowledged:** One warm sentence validating what they feel (never dismissive).
**What's happening here:** Identify the cognitive distortion in plain words (e.g., "This sounds like all-or-nothing thinking" or "catastrophising"). One sentence.
**A more balanced view:** 2–3 sentences offering a realistic, grounded reframe using CBT techniques. Honest — not toxic positivity.
**One question to sit with:** A single gentle Socratic question to help them explore the thought further.

Total response: under 160 words. Never clinical. Never preachy. Warm and honest.`

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY ?? ''
  if (!apiKey) {
    return makeResponse(fallbackStream("The AI key is missing — add GEMINI_API_KEY to your .env file."))
  }

  try {
    const { thought } = await req.json()
    if (!thought?.trim()) {
      return makeResponse(fallbackStream("Please share a thought to reframe."))
    }

    const genAI  = new GoogleGenerativeAI(apiKey)
    const model  = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: REFRAME_SYSTEM_PROMPT,
      generationConfig: { maxOutputTokens: 320, temperature: 0.7 },
    })

    const result = await model.generateContentStream(thought.trim())

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) controller.enqueue(sseText(text))
          }
          controller.enqueue(sseDone())
        } catch (e) {
          console.error('Reframe stream error:', e)
          controller.enqueue(sseText("Something went quiet mid-stream — want to try again?"))
          controller.enqueue(sseDone())
        } finally { controller.close() }
      },
    })

    return makeResponse(readable)
  } catch (err: unknown) {
    console.error('Reframe API error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    const friendly = msg.includes('429') || msg.includes('quota')
      ? "We're a little busy right now — please try again in a moment."
      : "Something didn't connect just now. Please try again."
    return makeResponse(fallbackStream(friendly))
  }
}
