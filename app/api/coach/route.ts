import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

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
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

const encoder = new TextEncoder()
function fallbackSSE(msg: string) {
  return new Response(
    new ReadableStream({
      start(c) {
        c.enqueue(encoder.encode(`data: ${JSON.stringify({ text: msg })}\n\n`))
        c.enqueue(encoder.encode('data: [DONE]\n\n'))
        c.close()
      },
    }),
    { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } }
  )
}

export async function POST(req: NextRequest) {
  if (!genAI) {
    return fallbackSSE("The Calm Coach isn't configured yet — GEMINI_API_KEY is missing from the server environment.")
  }

  try {
    const { messages } = await req.json()
    if (!messages?.length) {
      return new Response('Messages required', { status: 400 })
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: COACH_SYSTEM_PROMPT,
      generationConfig: { maxOutputTokens: 800, temperature: 0.75 },
    })

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
    const lastMessage = messages[messages.length - 1].content

    const chat = model.startChat({ history })

    const abort     = new AbortController()
    const timeoutId = setTimeout(() => abort.abort(), 60_000)

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(lastMessage)
          for await (const chunk of result.stream) {
            if (abort.signal.aborted) break
            const text = chunk.text()
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
        } catch (streamErr) {
          console.error('Coach stream error:', streamErr)
          const msg = streamErr instanceof Error ? streamErr.message : String(streamErr)
          const friendly = msg.includes('API_KEY') || msg.includes('API key') || msg.includes('invalid')
            ? "The AI key isn't configured correctly — please add GEMINI_API_KEY to the server environment."
            : msg.includes('429') || msg.includes('quota')
            ? "We're a little busy right now — please try again in a moment. 💙"
            : "I'm sorry, I couldn't connect just now. Please try again in a moment. 🌿"
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: friendly })}\n\n`))
        } finally {
          clearTimeout(timeoutId)
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
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
    const friendly = msg.includes('429') || msg.includes('quota')
      ? "We're a little busy right now — please try again in a moment. 💙"
      : "I'm sorry, I couldn't connect just now. Please try again in a moment. 🌿"
    return fallbackSSE(friendly)
  }
}
