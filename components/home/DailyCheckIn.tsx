'use client'

import { useState, useEffect } from 'react'
import { useSession }          from 'next-auth/react'
import Link                    from 'next/link'

// ── Types ────────────────────────────────────────────────────────────────────

interface CheckInStatus {
  checkedIn:     boolean
  mood:          number | null
  streak:        number
  longestStreak: number
}

// ── Mood config ───────────────────────────────────────────────────────────────

const MOODS = [
  { value: 1, emoji: '😔', label: 'Rough' },
  { value: 2, emoji: '😕', label: 'Low'   },
  { value: 3, emoji: '😐', label: 'Okay'  },
  { value: 4, emoji: '🙂', label: 'Good'  },
  { value: 5, emoji: '😊', label: 'Great' },
]

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="bg-white rounded-[24px] shadow-card border border-teal-light p-8 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 w-36 bg-teal-ghost rounded-full" />
        <div className="h-5 w-20 bg-teal-ghost rounded-full" />
      </div>
      <div className="flex gap-3 justify-center">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="w-14 h-16 bg-teal-ghost rounded-[14px]" />
        ))}
      </div>
    </div>
  )
}

// ── Flame visual ──────────────────────────────────────────────────────────────

function StreakFlame({ streak }: { streak: number }) {
  if (streak <= 0) return null
  return (
    <div className="flex items-center gap-1.5 bg-amber/10 border border-amber/30 rounded-full px-3 py-1">
      <span className="text-[1rem]">🔥</span>
      <span className="font-bold text-[0.88rem] text-amber">{streak} day{streak !== 1 ? 's' : ''}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function DailyCheckIn() {
  const { data: session, status: sessionStatus } = useSession()

  const [checkIn,    setCheckIn]    = useState<CheckInStatus | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [justDone,   setJustDone]   = useState(false)

  // Fetch status when session is ready
  useEffect(() => {
    if (sessionStatus === 'loading') return

    async function fetchStatus() {
      setLoading(true)
      try {
        const res  = await fetch('/api/checkin')
        const data = await res.json()
        setCheckIn(data)
      } catch {
        setCheckIn({ checkedIn: false, mood: null, streak: 0, longestStreak: 0 })
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [sessionStatus])

  async function handleSubmit() {
    if (!selected || submitting) return
    setSubmitting(true)
    try {
      const res  = await fetch('/api/checkin', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mood: selected }),
      })
      const data = await res.json()
      if (res.ok) {
        setCheckIn(data)
        setJustDone(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading skeleton
  if (loading || sessionStatus === 'loading') return <Skeleton />

  const streak        = checkIn?.streak        ?? 0
  const longestStreak = checkIn?.longestStreak ?? 0

  // ── Header row (shared by all states)
  const header = (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <span className="text-[1.1rem]">🌿</span>
        <span className="font-display font-semibold text-charcoal text-[1rem]">Daily Check-in</span>
      </div>
      {streak > 0 && <StreakFlame streak={streak} />}
    </div>
  )

  // ── Not signed in
  if (!session) {
    return (
      <div className="bg-white rounded-[24px] shadow-card border border-teal-light p-8">
        {header}
        <div className="text-center py-4">
          <p className="text-[2.5rem] mb-3">😊</p>
          <p className="text-text-mid text-[0.92rem] leading-[1.7] mb-5">
            Check in every day, track your mood, and build a streak that keeps you going.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-teal-deep font-semibold text-[0.9rem] hover:text-teal-dark transition-colors no-underline">
            Sign in to track your streak →
          </Link>
        </div>
      </div>
    )
  }

  // ── Already checked in (or just completed)
  if (checkIn?.checkedIn) {
    const moodData = MOODS[(checkIn.mood ?? 3) - 1]
    return (
      <div className={`bg-white rounded-[24px] shadow-card border border-teal-light p-8 transition-all duration-500 ${justDone ? 'scale-[1.01]' : ''}`}>
        {header}

        {/* Completion card */}
        <div className="flex flex-col items-center text-center py-2">
          <div className={`text-[3.5rem] mb-3 transition-transform duration-300 ${justDone ? 'scale-125' : ''}`}>
            {moodData.emoji}
          </div>

          <p className="font-display font-bold text-charcoal text-[1.05rem] mb-1">
            {justDone ? 'Check-in complete!' : 'Already checked in today'}
          </p>
          <p className="text-text-mid text-[0.85rem] mb-5">
            You logged <span className="font-semibold text-teal-deep">{moodData.label}</span> today
          </p>

          {/* Streak display */}
          <div className="flex items-center gap-6 mb-5">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <span className="text-[1.4rem]">🔥</span>
                <span className="font-bold text-[1.6rem] text-amber">{streak}</span>
              </div>
              <p className="text-text-xlight text-[0.72rem]">day streak</p>
            </div>
            <div className="w-px h-10 bg-teal-light" />
            <div className="text-center">
              <p className="font-bold text-[1.6rem] text-teal-deep mb-0.5">{longestStreak}</p>
              <p className="text-text-xlight text-[0.72rem]">longest streak</p>
            </div>
          </div>

          <Link
            href="/mood"
            className="text-teal-deep font-semibold text-[0.85rem] hover:text-teal-dark transition-colors no-underline">
            See your full mood history →
          </Link>
        </div>
      </div>
    )
  }

  // ── Not yet checked in
  return (
    <div className="bg-white rounded-[24px] shadow-card border border-teal-light p-8">
      {header}

      <h3 className="font-display font-bold text-charcoal text-[1.15rem] mb-1 text-center">
        How are you feeling today?
      </h3>
      <p className="text-text-xlight text-[0.82rem] text-center mb-6">
        Take a moment to check in — no judgement here.
      </p>

      {/* Mood buttons */}
      <div
        role="group"
        aria-label="Select your mood"
        className="flex gap-2 justify-center mb-6 flex-wrap">
        {MOODS.map(m => (
          <button
            key={m.value}
            onClick={() => setSelected(m.value)}
            aria-pressed={selected === m.value}
            aria-label={m.label}
            className={`
              flex flex-col items-center justify-center gap-1.5
              min-w-[56px] px-3 py-3 rounded-[16px] border-2
              transition-all duration-150
              ${selected === m.value
                ? 'border-amber bg-amber/8 scale-110 shadow-sm'
                : 'border-transparent hover:bg-teal-ghost hover:scale-105'}
            `}>
            <span className="text-[1.9rem] leading-none">{m.emoji}</span>
            <span className="text-[0.65rem] font-semibold text-text-mid whitespace-nowrap">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Submit button — appears when a mood is selected */}
      <div className={`transition-all duration-200 overflow-hidden ${selected ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
        <button
          onClick={handleSubmit}
          disabled={!selected || submitting}
          className="w-full bg-teal-deep text-white py-3.5 rounded-full font-semibold text-[0.95rem] hover:bg-teal-dark disabled:opacity-50 transition-colors">
          {submitting ? 'Checking in…' : 'Check in ✓'}
        </button>
      </div>
    </div>
  )
}
