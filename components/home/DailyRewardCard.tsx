'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// ── Daily Hope Coins claim 🪙 ───────────────────────────────────────────────
// The come-back-tomorrow hook: one tap a day, bonus scales with streak.
// Claiming also touches the streak so the visit itself counts.

interface CoinStatus {
  balance: number
  streak: number
  claimedToday: boolean
  todayAmount: number
}

export function DailyRewardCard() {
  const { status } = useSession()
  const [data, setData]       = useState<CoinStatus | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [justClaimed, setJustClaimed] = useState<number | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/coins')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setData(d) })
      .catch(() => {})
  }, [status])

  async function claim() {
    if (!data || data.claimedToday || claiming) return
    setClaiming(true)
    try {
      // The visit counts: touch streak first so today's day is in the streak,
      // then claim (claim amount uses the updated streak)
      await fetch('/api/streak', { method: 'POST' }).catch(() => {})
      const res = await fetch('/api/coins', { method: 'POST' })
      const d   = await res.json()
      if (d.ok && !d.alreadyClaimed) {
        setJustClaimed(d.claimed)
        setData({ ...data, balance: d.balance, claimedToday: true })
      } else if (d.alreadyClaimed) {
        setData({ ...data, balance: d.balance, claimedToday: true })
      }
    } finally {
      setClaiming(false)
    }
  }

  if (status !== 'authenticated' || !data) return null

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber/15 via-white to-teal-ghost border border-amber/30 p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-[2rem]">🪙</span>
          <div>
            <p className="font-display font-bold text-charcoal text-[0.98rem] leading-tight">
              {data.claimedToday
                ? justClaimed
                  ? `+${justClaimed} Hope Coins collected!`
                  : 'Today’s coins collected ✓'
                : `Your daily +${data.todayAmount} 🪙 is ready`}
            </p>
            <p className="text-text-xlight text-[0.75rem] mt-0.5">
              Balance: <span className="font-bold text-amber">{data.balance} 🪙</span>
              {data.streak >= 7 && <span> · 🔥 streak bonus active</span>}
              {data.streak > 0 && data.streak < 7 && <span> · streak day {data.streak} — bonus coins at day 7</span>}
            </p>
          </div>
        </div>

        {data.claimedToday ? (
          <Link href="/rewards"
            className="text-[0.8rem] font-semibold text-amber hover:text-amber-soft no-underline transition-colors flex-shrink-0">
            Rewards store →
          </Link>
        ) : (
          <button onClick={claim} disabled={claiming}
            className="bg-amber text-charcoal font-bold text-[0.85rem] px-5 py-2.5 rounded-full hover:bg-amber-soft hover:scale-105 active:scale-95 transition-all disabled:opacity-60 flex-shrink-0 shadow-sm">
            {claiming ? 'Collecting…' : 'Collect 🪙'}
          </button>
        )}
      </div>
    </div>
  )
}
