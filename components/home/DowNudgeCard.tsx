'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export function DowNudgeCard() {
  const { status } = useSession()
  const [data,      setData]      = useState<{ day: string; avgMood: number; isTomorrow: boolean } | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    const key = `ltp-dow-nudge-${new Date().toDateString()}`
    if (sessionStorage.getItem(key)) { setDismissed(true); return }
    fetch('/api/insights/dow-pattern')
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {})
  }, [status])

  const dismiss = () => {
    setDismissed(true)
    sessionStorage.setItem(`ltp-dow-nudge-${new Date().toDateString()}`, '1')
  }

  if (dismissed || !data) return null

  const { day, isTomorrow } = data
  const heading = isTomorrow
    ? `${day}s tend to feel harder for you`
    : `${day}s can feel harder — you know this`
  const body = isTomorrow
    ? `Your data shows you often feel lower on ${day}s. A gentle wind-down tonight could make tomorrow easier.`
    : `You tend to feel lower today. That's okay — your patterns show this passes. Pick one small kind thing for yourself.`

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 rounded-[18px] px-4 py-4 relative">
      <button onClick={dismiss} className="absolute top-3 right-3 text-slate-300 hover:text-slate-500 text-lg leading-none">×</button>
      <p className="text-[0.65rem] font-bold text-indigo-400 uppercase tracking-widest mb-2">📅 Pattern spotted</p>
      <p className="font-bold text-charcoal text-[0.9rem] leading-snug mb-1">{heading}</p>
      <p className="text-text-xlight text-[0.78rem] leading-relaxed mb-3">{body}</p>
      <div className="flex gap-2">
        <Link href="/journal"   className="text-[0.75rem] font-semibold text-teal-deep border border-teal-mid px-3 py-1 rounded-full no-underline hover:bg-teal-ghost transition-colors">Journal</Link>
        <Link href="/breathing" className="text-[0.75rem] font-semibold text-teal-deep border border-teal-mid px-3 py-1 rounded-full no-underline hover:bg-teal-ghost transition-colors">Breathe</Link>
        <Link href="/sounds"    className="text-[0.75rem] font-semibold text-teal-deep border border-teal-mid px-3 py-1 rounded-full no-underline hover:bg-teal-ghost transition-colors">Calm sounds</Link>
      </div>
    </div>
  )
}
