import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const SYSTEM_PROMPT =
  'You are a warm affirmation writer for letsthinkpositive.com. Write ONE single affirmation sentence — beautiful, honest, empowering, and personal. It should feel like something a wise friend would say. Maximum 18 words. No quotation marks. No prefix like "Affirmation:". Just the affirmation itself.'

const FALLBACKS = [
  'You are enough, exactly as you are right now.',
  'Every small step you take is an act of quiet courage.',
  'Your feelings are valid, and so is your need to rest.',
  'You have already survived everything life has thrown at you.',
  'Today you choose yourself, and that is more than enough.',
  'You carry more strength than you have ever been told.',
  'Peace lives inside you — you are allowed to return to it.',
  'You are not behind; you are exactly where you need to be.',
  'Your kindness to others begins with kindness to yourself.',
  'Difficult days do not define you — your heart does.',
  'You are worthy of love that feels safe and steady.',
  'Trust yourself — you have navigated hard things before.',
  'The world is better because you show up, even on hard days.',
  'Your growth is real, even when you cannot see it clearly.',
  'You deserve the same compassion you give so freely to others.',
  'Rest is not giving up — it is how you gather yourself again.',
  'You are resilient in ways you have not yet had to discover.',
  'Hope is not naïve; it is the bravest thing you can carry.',
  'You are allowed to take up space and shine without apology.',
  'Something good is still possible for you today.',
]

function pickFallback(mood?: string, theme?: string): string {
  const seed = ((mood ?? '').length + (theme ?? '').length) % FALLBACKS.length
  return FALLBACKS[seed]
}

export async function POST(req: NextRequest) {
  const { mood, theme } = await req.json().catch(() => ({}))
  const apiKey = process.env.GROQ_API_KEY ?? ''

  if (!apiKey) {
    return NextResponse.json({ affirmation: pickFallback(mood, theme) })
  }

  try {
    const groq = new Groq({ apiKey })

    const userPrompt = [
      mood  ? `The person is feeling: ${mood}.`           : '',
      theme ? `They want an affirmation about: ${theme}.` : '',
      'Write the affirmation now.',
    ].filter(Boolean).join(' ')

    const completion = await groq.chat.completions.create({
      model:       'llama-3.1-8b-instant',  // fast lightweight model — ideal for single sentences
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens:  60,
      temperature: 0.85,
      stream:      false,
    })

    const raw         = completion.choices[0]?.message?.content?.trim() ?? ''
    const affirmation = raw.replace(/^["'"]+|["'"]+$/g, '').trim()

    return NextResponse.json({ affirmation: affirmation || pickFallback(mood, theme) })
  } catch (err) {
    console.error('Affirmation API error:', err)
    return NextResponse.json({ affirmation: pickFallback(mood, theme) })
  }
}
