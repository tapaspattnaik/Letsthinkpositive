'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// ── Time-of-day adaptive card ────────────────────────────────────────────────
// Morning → set an intention; Afternoon → mood check + breathe; Evening → gratitude + wind-down.
// Pure client logic (no AI cost) — renders the contextually-right next action.

type Period = 'morning' | 'afternoon' | 'evening' | 'night'

function getPeriod(hour: number): Period {
  if (hour >= 5 && hour < 12)  return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

interface Cta { href: string; icon: string; label: string; primary?: boolean }

const PERIOD_CONTENT: Record<Period, {
  greeting: string
  emoji: string
  message: string
  ctas: Cta[]
}> = {
  morning: {
    greeting: 'Good morning',
    emoji: '🌅',
    message: 'A fresh page. Set one word to anchor your day.',
    ctas: [
      { href: '/intention',   icon: '🌅', label: 'Set today’s intention', primary: true },
      { href: '/affirmation', icon: '💌', label: 'Morning affirmation' },
    ],
  },
  afternoon: {
    greeting: 'Good afternoon',
    emoji: '☀️',
    message: 'Midday pause — how is the day treating you?',
    ctas: [
      { href: '/mood',      icon: '📊', label: 'Quick mood check-in', primary: true },
      { href: '/breathing', icon: '🌬️', label: '2-minute breather' },
    ],
  },
  evening: {
    greeting: 'Good evening',
    emoji: '🌇',
    message: 'Before the day closes — what was good about it?',
    ctas: [
      { href: '/journal', icon: '📓', label: 'Evening gratitude', primary: true },
      { href: '/sleep',   icon: '🌙', label: 'Wind down for sleep' },
    ],
  },
  night: {
    greeting: 'Still up',
    emoji: '🌙',
    message: 'Racing thoughts? Let’s slow them down together.',
    ctas: [
      { href: '/breathing', icon: '🌬️', label: '4-7-8 breath for sleep', primary: true },
      { href: '/sounds',    icon: '🎧', label: 'Calming sounds' },
    ],
  },
}

// Gentle-mode override: when the user has had a rough stretch, lead with calm —
// no streaks, no productivity asks. See /api/gentle-mode.
const GENTLE_CTAS: Cta[] = [
  { href: '/breathing', icon: '🌬️', label: 'Breathe with me', primary: true },
  { href: '/coach',     icon: '🌿', label: 'Talk to your Calm Coach' },
]

export function TimeOfDayCard() {
  const { data: session, status } = useSession()
  const [period, setPeriod] = useState<Period | null>(null)
  const [gentle, setGentle] = useState(false)

  // Resolve period client-side only (avoids SSR/client hour mismatch)
  useEffect(() => {
    setPeriod(getPeriod(new Date().getHours()))
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/gentle-mode')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.gentle) setGentle(true) })
      .catch(() => {})
  }, [status])

  if (status !== 'authenticated' || !period) return null

  const content   = PERIOD_CONTENT[period]
  const firstName = session?.user?.name?.split(' ')[0] ?? 'friend'
  const message   = gentle
    ? 'No pressure today. One gentle breath is more than enough.'
    : content.message
  const ctas = gentle ? GENTLE_CTAS : content.ctas

  return (
    <div className="rounded-2xl bg-white border border-teal-light/60 shadow-card p-5">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[1.3rem]">{content.emoji}</span>
        <p className="font-display font-bold text-charcoal text-[1.05rem]">
          {content.greeting}, {firstName}
        </p>
      </div>
      <p className="text-text-mid text-[0.85rem] mb-4 leading-relaxed">{message}</p>
      <div className="flex flex-wrap gap-2">
        {ctas.map(cta => (
          <Link key={cta.href} href={cta.href}
            className={`inline-flex items-center gap-1.5 text-[0.8rem] font-semibold px-4 py-2 rounded-full no-underline transition-all
              ${cta.primary
                ? 'bg-teal-deep text-white hover:bg-teal-dark shadow-sm'
                : 'bg-teal-ghost text-teal-deep border border-teal-light hover:border-teal-mid'}`}>
            <span>{cta.icon}</span>{cta.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
