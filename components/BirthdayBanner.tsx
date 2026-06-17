'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface BirthdayInfo {
  isBirthday: boolean
  name?: string
  age?: number | null
  bonus?: number
  awarded?: boolean
}

export function BirthdayBanner() {
  const { status } = useSession()
  const [info, setInfo] = useState<BirthdayInfo | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    // Don't re-show if dismissed today
    const key = `ltp_bday_dismissed_${new Date().toISOString().slice(0, 10)}`
    if (localStorage.getItem(key)) { setDismissed(true); return }
    fetch('/api/birthday-check')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.isBirthday) setInfo(d) })
      .catch(() => {})
  }, [status])

  if (status !== 'authenticated' || dismissed || !info?.isBirthday) return null

  function dismiss() {
    const key = `ltp_bday_dismissed_${new Date().toISOString().slice(0, 10)}`
    localStorage.setItem(key, '1')
    setDismissed(true)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7B2FF7] to-[#F107A3] text-white p-5 shadow-lift">
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none opacity-40" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} style={{ position: 'absolute', left: `${(i * 41) % 100}%`, top: `${(i * 29) % 100}%`, fontSize: `${12 + (i % 3) * 6}px` }}>
            {['🎉', '🎈', '✨', '🎂'][i % 4]}
          </span>
        ))}
      </div>

      <button onClick={dismiss} aria-label="Dismiss"
        className="absolute top-2.5 right-3 text-white/70 hover:text-white text-lg leading-none w-7 h-7 flex items-center justify-center">×</button>

      <div className="relative flex items-center gap-4">
        <span className="text-[2.4rem] flex-shrink-0">🎂</span>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-[1.15rem] leading-tight">
            Happy Birthday, {info.name}!
          </p>
          <p className="text-white/85 text-[0.85rem] mt-0.5">
            {info.age ? `${info.age} years of you making the world brighter. ` : ''}
            {info.awarded
              ? `We added ${info.bonus} Hope Coins to your balance as a gift 🪙`
              : 'Wishing you the most wonderful day 💛'}
          </p>
        </div>
        <Link href="/birthday-card"
          className="flex-shrink-0 bg-white text-[#7B2FF7] text-[0.8rem] font-bold px-4 py-2 rounded-full no-underline hover:bg-white/90 transition-colors">
          Make a card →
        </Link>
      </div>
    </div>
  )
}
