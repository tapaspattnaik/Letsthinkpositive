'use client'

// Lightweight distress signal detector — runs entirely client-side on journal text.
// No API call, no data sent anywhere. Shows a calm banner with helplines.

const SIGNALS = [
  /\b(want to die|kill myself|end my life|end it all|no reason to live|better off dead|harm myself|hurt myself|self.harm|suicid|not worth living)\b/i,
]

// Global-first crisis resources. Find a Helpline covers every country; the
// others are major 24/7 lines for the largest English-speaking regions.
const HELPLINES: { name: string; number: string; note: string; href: string }[] = [
  { name: 'Find a Helpline', number: 'findahelpline.com', note: 'free & confidential — your country', href: 'https://findahelpline.com' },
  { name: '988 Suicide & Crisis Lifeline', number: '988', note: 'US & Canada · 24/7', href: 'tel:988' },
  { name: 'Samaritans', number: '116 123', note: 'UK & Ireland · 24/7', href: 'tel:116123' },
]

interface Props { text: string }

export function DistressSupport({ text }: Props) {
  const triggered = SIGNALS.some(r => r.test(text))
  if (!triggered) return null

  return (
    <div className="my-4 rounded-[20px] bg-rose-50 border border-rose-200 p-5 animate-fade-in">
      <div className="flex items-start gap-3">
        <span className="text-[1.5rem] flex-shrink-0 mt-0.5">💙</span>
        <div>
          <p className="font-display font-bold text-rose-700 text-[0.97rem] mb-1">
            You don&apos;t have to carry this alone.
          </p>
          <p className="text-rose-600 text-[0.85rem] leading-relaxed mb-3">
            It sounds like things are really hard right now. Talking to someone trained to listen can help — please reach out.
          </p>
          <div className="flex flex-col gap-2">
            {HELPLINES.map(h => (
              <div key={h.name} className="flex items-center gap-3">
                <a href={h.href}
                  {...(h.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="font-bold text-rose-700 text-[0.88rem] underline underline-offset-2 hover:text-rose-900">
                  {h.name}: {h.number}
                </a>
                <span className="text-rose-400 text-[0.72rem]">{h.note}</span>
              </div>
            ))}
          </div>
          <p className="text-rose-400 text-[0.72rem] mt-3">
            Your journal entry is still saved. You can also chat with Bit, our AI companion, anytime.
          </p>
        </div>
      </div>
    </div>
  )
}

export function useDistressCheck(text: string): boolean {
  return SIGNALS.some(r => r.test(text))
}
