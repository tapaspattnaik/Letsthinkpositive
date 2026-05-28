import { NextRequest, NextResponse } from 'next/server'
import Together from 'together-ai'

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
  // Seed selection loosely by mood+theme for variety
  const seed = ((mood ?? '').length + (theme ?? '').length) % FALLBACKS.length
  return FALLBACKS[seed]
}

export async function POST(req: NextRequest) {
  const { mood, theme } = await req.json().catch(() => ({}))

  const apiKey = process.env.TOGETHER_API_KEY ?? ''

  if (!apiKey) {
    return NextResponse.json({ affirmation: pickFallback(mood, theme) })
  }

  try {
    const together = new Together({ apiKey })

    const moodLine = mood ? `The person is feeling: ${mood}.` : ''
    const themeLine = theme ? `They want an affirmation about: ${theme}.` : ''
    const userPrompt = [moodLine, themeLine, 'Write the affirmation now.']
      .filter(Boolean)
      .join(' ')

    const response = await together.chat.completions.create({
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 60,
      temperature: 0.85,
      stream: false,
    })

    const raw = response.choices[0]?.message?.content?.trim() ?? ''
    // Strip any stray leading/trailing quotes the model might add
    const affirmation = raw.replace(/^["'"]+|["'"]+$/g, '').trim()

    if (!affirmation) {
      return NextResponse.json({ affirmation: pickFallback(mood, theme) })
    }

    return NextResponse.json({ affirmation })
  } catch (err) {
    console.error('Affirmation API error:', err)
    return NextResponse.json({ affirmation: pickFallback(mood, theme) })
  }
}
