import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Temporary diagnostic endpoint — remove after confirming Gemini works
// Visit: /api/test-ai to see the result
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ status: 'error', reason: 'GEMINI_API_KEY not set in environment' })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent('Say "Gemini connected successfully" and nothing else.')
    const text = result.response.text()
    return NextResponse.json({ status: 'ok', response: text, keyPrefix: apiKey.slice(0, 6) + '...' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({
      status: 'error',
      error: msg,
      keyPrefix: apiKey.slice(0, 6) + '...',
    })
  }
}
