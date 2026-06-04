import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// Diagnostic endpoint — visit /api/test-ai to verify Groq is connected
export async function GET() {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return NextResponse.json({ status: 'error', reason: 'GROQ_API_KEY not set in environment' })
  }

  try {
    const groq = new Groq({ apiKey })
    const completion = await groq.chat.completions.create({
      model:      'llama-3.3-70b-versatile',
      messages:   [{ role: 'user', content: 'Say "Groq connected successfully" and nothing else.' }],
      max_tokens: 20,
      stream:     false,
    })
    const text = completion.choices[0]?.message?.content?.trim()
    return NextResponse.json({ status: 'ok', response: text, keyPrefix: apiKey.slice(0, 8) + '...' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({
      status: 'error',
      error:  msg,
      keyPrefix: apiKey.slice(0, 8) + '...',
    })
  }
}
