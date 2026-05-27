import { NextRequest } from 'next/server'
import Together from 'together-ai'

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

Categories you can support:
- Mood reflection: Understanding and processing current emotions
- Motivation: Finding energy and purpose on difficult days
- Reflection: Looking back on experiences with compassion and insight
- Breathwork & calm: Guiding breathing exercises
- Gratitude: Building appreciation practices
- Sleep & rest: Gentle support for wind-down routines

Remember: You are a wellness guide, not a therapist. If someone expresses crisis-level distress, gently encourage them to reach out to a professional or helpline.`

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
  const apiKey = process.env.TOGETHER_API_KEY ?? ''
  if (!apiKey) {
    return fallbackSSE("The Calm Coach isn't configured yet — TOGETHER_API_KEY is missing from the server environment.")
  }

  try {
    const { messages } = await req.json()
    if (!messages?.length) {
      return new Response('Messages required', { status: 400 })
    }

    const together = new Together({ apiKey })

    const stream = await together.chat.completions.create({
      model:       'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      messages:    [{ role: 'system', content: COACH_SYSTEM_PROMPT }, ...messages],
      max_tokens:  800,
      temperature: 0.75,
      stream:      true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
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
