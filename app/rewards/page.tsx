'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// ── Rewards — Hope Coins balance, store & ledger 🪙 ─────────────────────────

interface Txn { id: number; amount: number; reason: string; createdAt: string }
interface CoinStatus {
  balance: number
  streak: number
  streakFreezes: number
  claimedToday: boolean
  todayAmount: number
  ledger: Txn[]
}

const STORE_ITEMS = [
  {
    key: 'freeze', icon: '🧊', name: 'Streak Freeze', cost: 100,
    desc: 'Automatically saves your streak if you miss a single day. Max 3 held at once.',
  },
  {
    key: 'badge-star', icon: '🌟', name: 'Star Supporter Badge', cost: 250,
    desc: 'An exclusive gold badge for your profile — only available with coins.',
  },
  {
    key: 'badge-butterfly', icon: '🦋', name: 'Butterfly of Hope Badge', cost: 500,
    desc: 'The rarest badge in the app. Platinum tier. Pure dedication.',
  },
]

const EARN_RULES = [
  { icon: '☀️', label: 'Daily collect',            amount: '+10' },
  { icon: '🔥', label: 'Daily collect (7+ day streak)',  amount: '+15' },
  { icon: '⚡', label: 'Daily collect (30+ day streak)', amount: '+20' },
  { icon: '🏆', label: 'Complete a challenge',     amount: '+50' },
  { icon: '🏅', label: 'Earn a badge',             amount: '+25' },
]

function reasonLabel(reason: string): string {
  if (reason === 'daily_claim')                return '☀️ Daily collect'
  if (reason === 'badge_earned')               return '🏅 Badge earned'
  if (reason.startsWith('challenge_complete')) return '🏆 Challenge completed'
  if (reason === 'redeem_freeze')              return '🧊 Streak Freeze'
  if (reason.startsWith('redeem_badge'))       return '🎖️ Exclusive badge'
  return reason.replace(/_/g, ' ')
}

export default function RewardsPage() {
  const { status } = useSession({ required: true })
  const [data, setData]     = useState<CoinStatus | null>(null)
  const [busy, setBusy]     = useState<string | null>(null)
  const [toast, setToast]   = useState('')

  const load = useCallback(() => {
    fetch('/api/coins')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setData(d) })
      .catch(() => {})
  }, [])

  useEffect(() => { if (status === 'authenticated') load() }, [status, load])

  async function claim() {
    setBusy('claim')
    await fetch('/api/streak', { method: 'POST' }).catch(() => {})
    const res = await fetch('/api/coins', { method: 'POST' })
    const d   = await res.json()
    if (d.ok && d.claimed) setToast(`+${d.claimed} 🪙 collected!`)
    load()
    setBusy(null)
    setTimeout(() => setToast(''), 3000)
  }

  async function redeem(key: string, name: string, cost: number) {
    if (!confirm(`Redeem ${name} for ${cost} 🪙?`)) return
    setBusy(key)
    try {
      const res = await fetch('/api/coins/redeem', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: key }),
      })
      const d = await res.json()
      setToast(d.ok ? `🎁 ${d.item} is yours!` : (d.error ?? 'Something went wrong'))
      load()
    } finally {
      setBusy(null)
      setTimeout(() => setToast(''), 4000)
    }
  }

  if (status === 'loading' || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-ghost pt-[72px]">
        <div className="flex gap-1.5">
          {[0,1,2].map(i => <span key={i} className="w-3 h-3 rounded-full bg-amber animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff9ec] to-ivory pt-[100px] pb-16 px-[5%]">
      <div className="max-w-4xl mx-auto">

        {/* Header + balance */}
        <div className="text-center mb-10">
          <span className="text-[3rem] block mb-2">🪙</span>
          <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-bold text-charcoal mb-2">Hope Coins</h1>
          <p className="text-text-mid text-[0.95rem] max-w-md mx-auto leading-relaxed">
            Earned by showing up for yourself. Spend them on perks that protect your progress.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 bg-white border border-amber/40 rounded-full px-8 py-4 shadow-card">
            <span className="font-display font-bold text-[2rem] text-amber leading-none">{data.balance}</span>
            <span className="text-text-mid text-[0.85rem] font-semibold">coins</span>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-charcoal text-white text-[0.85rem] font-semibold px-5 py-3 rounded-full shadow-lift">
            {toast}
          </div>
        )}

        {/* Daily claim */}
        <div className="bg-gradient-to-r from-amber/20 to-amber/5 border border-amber/30 rounded-[20px] p-5 mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-display font-bold text-charcoal text-[1.05rem]">
              {data.claimedToday ? "Today's coins collected ✓" : `Today's collect: +${data.todayAmount} 🪙`}
            </p>
            <p className="text-text-xlight text-[0.78rem] mt-0.5">
              {data.streak >= 30 ? '⚡ 30-day streak bonus active (+10)'
                : data.streak >= 7 ? '🔥 7-day streak bonus active (+5)'
                : `Reach a 7-day streak for bonus coins (currently day ${data.streak})`}
              {' '}· come back tomorrow for more
            </p>
          </div>
          {!data.claimedToday && (
            <button onClick={claim} disabled={busy === 'claim'}
              className="bg-amber text-charcoal font-bold text-[0.9rem] px-6 py-3 rounded-full hover:bg-amber-soft hover:scale-105 active:scale-95 transition-all disabled:opacity-60 shadow-sm">
              {busy === 'claim' ? 'Collecting…' : 'Collect now 🪙'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Store */}
          <div>
            <h2 className="font-display font-bold text-charcoal text-[1.2rem] mb-4">🎁 Rewards Store</h2>
            <div className="space-y-4">
              {STORE_ITEMS.map(item => {
                const affordable = data.balance >= item.cost
                const freezeMaxed = item.key === 'freeze' && data.streakFreezes >= 3
                return (
                  <div key={item.key}
                    className="bg-white border border-teal-light/60 rounded-[20px] p-5 flex items-center gap-4 shadow-card">
                    <span className="text-[2.2rem] flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-charcoal text-[0.95rem]">{item.name}</p>
                      <p className="text-text-mid text-[0.8rem] leading-relaxed mt-0.5">{item.desc}</p>
                      {item.key === 'freeze' && (
                        <p className="text-sky-500 text-[0.72rem] font-semibold mt-1">You hold {data.streakFreezes}/3</p>
                      )}
                    </div>
                    <button
                      onClick={() => redeem(item.key, item.name, item.cost)}
                      disabled={!affordable || freezeMaxed || busy === item.key}
                      className={`flex-shrink-0 font-bold text-[0.82rem] px-4 py-2.5 rounded-full transition-all
                        ${affordable && !freezeMaxed
                          ? 'bg-teal-deep text-white hover:bg-teal-dark hover:scale-105'
                          : 'bg-gray-100 text-text-xlight cursor-not-allowed'}`}>
                      {busy === item.key ? '…' : freezeMaxed ? 'Maxed' : `${item.cost} 🪙`}
                    </button>
                  </div>
                )
              })}
            </div>
            <p className="text-text-xlight text-[0.75rem] mt-4 leading-relaxed">
              More rewards coming — including real-world perks. Coins never expire.
            </p>
          </div>

          {/* Sidebar: earn rules + ledger */}
          <div className="space-y-5">
            <div className="bg-white border border-teal-light/60 rounded-[20px] p-5 shadow-card">
              <p className="text-[0.7rem] font-bold text-teal-mid uppercase tracking-widest mb-3">How to earn</p>
              <div className="space-y-2.5">
                {EARN_RULES.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-[0.83rem]">
                    <span className="text-text-mid">{r.icon} {r.label}</span>
                    <span className="font-bold text-amber">{r.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-teal-light/60 rounded-[20px] p-5 shadow-card">
              <p className="text-[0.7rem] font-bold text-teal-mid uppercase tracking-widest mb-3">Recent activity</p>
              {data.ledger.length === 0 ? (
                <p className="text-text-xlight text-[0.8rem]">No transactions yet — collect your first coins above!</p>
              ) : (
                <div className="space-y-2">
                  {data.ledger.map(t => (
                    <div key={t.id} className="flex items-center justify-between text-[0.8rem]">
                      <div className="min-w-0">
                        <span className="text-text-mid">{reasonLabel(t.reason)}</span>
                        <span className="text-text-xlight text-[0.68rem] ml-1.5">
                          {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <span className={`font-bold flex-shrink-0 ${t.amount > 0 ? 'text-green-600' : 'text-red-400'}`}>
                        {t.amount > 0 ? '+' : ''}{t.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href="/challenges"
              className="block bg-gradient-to-br from-teal-deep to-teal-dark rounded-[20px] p-5 no-underline hover:shadow-lift transition-all text-center">
              <p className="text-white font-display font-bold text-[0.95rem]">🏆 Biggest earner: challenges</p>
              <p className="text-white/60 text-[0.75rem] mt-1">+50 coins each — start one today →</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
