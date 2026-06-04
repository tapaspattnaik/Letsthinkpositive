import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getLanguage } from '@/lib/languages'

// Translates an array of UI strings to the target language.
// Uses a cache-friendly batch approach — translate up to 30 strings at once.
export async function POST(req: NextRequest) {
  const { texts, targetLang } = await req.json()

  if (!texts?.length || !targetLang || targetLang === 'en') {
    return NextResponse.json({ translations: texts })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ translations: texts })
  }

  const lang = getLanguage(targetLang)

  try {
    const groq = new Groq({ apiKey })

    // Send all strings as a numbered list for batch translation
    const numbered = texts.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')

    const completion = await groq.chat.completions.create({
      model:       'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens:  2000,
      stream:      false,
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the numbered list of UI strings to ${lang.english} (${lang.label}).

Rules:
- Keep the same numbering format: "1. translated text"
- Preserve any emoji, special characters, punctuation, and tone
- Keep translations natural and warm — this is a wellness app
- Do NOT translate proper nouns like "letsthinkpositive.com", "Tapas", brand names
- Return ONLY the numbered translations, nothing else`,
        },
        {
          role: 'user',
          content: `Translate these strings to ${lang.english}:\n\n${numbered}`,
        },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim() ?? ''
    const lines = raw.split('\n').filter(l => /^\d+\./.test(l.trim()))

    const translations = texts.map((_: string, i: number) => {
      const line = lines.find(l => l.trim().startsWith(`${i + 1}.`))
      if (!line) return texts[i] // fallback to original
      return line.replace(/^\d+\.\s*/, '').trim()
    })

    return NextResponse.json({ translations })
  } catch (err) {
    console.error('Translation error:', err)
    return NextResponse.json({ translations: texts }) // fallback to originals
  }
}
