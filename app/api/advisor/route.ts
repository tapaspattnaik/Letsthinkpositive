import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ADVISOR_SYSTEM_PROMPT } from '@/lib/together'

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
  const apiKey = process.env.GEMINI_API_KEY ?? ''
  if (!apiKey) {
    return makeResponse(fallbackStream(
      "Bit isn't configured yet — add GEMINI_API_KEY to your .env file and restart the server."
    ))
  }

  try {
    const { messages, mood } = await req.json()

    const systemPrompt = mood
      ? `${ADVISOR_SYSTEM_PROMPT}\n\nThe user's current mood: ${mood}. Tailor your opening tone accordingly.`
      : ADVISOR_SYSTEM_PROMPT

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      generationConfig: { maxOutputTokens: 280, temperature: 0.7 },
    })

    const history = (messages || []).slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
    const lastMessage = messages?.[messages.length - 1]?.content ?? ''

    const chat   = model.startChat({ history })
    const result = await chat.sendMessageStream(lastMessage)

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) controller.enqueue(sseText(text))
          }
        } catch (e) {
          console.error('Advisor stream error:', e)
          const msg = e instanceof Error ? e.message : String(e)
          const friendly = msg.includes('API_KEY') || msg.includes('API key') || msg.includes('invalid')
            ? "I'm not configured correctly — please add GEMINI_API_KEY to the server environment."
            : msg.includes('429') || msg.includes('quota')
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
    const friendly = msg.includes('429') || msg.includes('quota')
      ? "We're getting a lot of love right now — please try again in a moment. 💙"
      : "I'm having a quiet moment — please try again."
    return makeResponse(fallbackStream(friendly))
  }
}
