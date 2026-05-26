import { NextRequest } from 'next/server'
import Together from 'together-ai'
import { ADVISOR_SYSTEM_PROMPT } from '@/lib/together'

export async function POST(req: NextRequest) {
  const together = new Together({ apiKey: process.env.TOGETHER_API_KEY ?? '' })
  try {
    const { messages, mood } = await req.json()

    const systemPrompt = mood
      ? `${ADVISOR_SYSTEM_PROMPT}\n\nThe user's current mood: ${mood}. Tailor your opening tone accordingly.`
      : ADVISOR_SYSTEM_PROMPT

    const stream = await together.chat.completions.create({
      model:       'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      messages:    [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens:  1024,
      temperature: 0.7,
      stream:      true,
    })

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } finally {
          controller.close()
        }
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
    console.error('Advisor API error:', err)
    return new Response('Internal server error', { status: 500 })
  }
}
