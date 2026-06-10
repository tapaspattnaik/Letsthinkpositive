'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Component { score: number; max: number; value: number | null }
interface ScoreData {
  pwi: number
  label: string
  colour: string
  hasData: boolean
  personalBests?: string[]
  components: {
    mood:   Component
    sleep:  Component
    streak: Component
    habits: Component
  }
}

// SVG circular gauge — simple arc using stroke-dasharray trick
function CircleGauge({ score, colour }: { score: number; colour: string }) {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {/* Track */}
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5f0ef" strokeWidth="8" />
        {/* Progress */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={colour}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      {/* Centre text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-[1.6rem] leading-none" style={{ color: colour }}>
          {score}
        </span>
        <span className="text-[0.6rem] text-text-xlight font-semibold uppercase tracking-wider mt-0.5">
          PWI
        </span>
      </div>
    </div>
  )
}

function ComponentRow({
  emoji, label, score, max, display,
}: { emoji: string; label: string; score: number; max: number; display: string | null }) {
  const pct = Math.round((score / max) * 100)
  return (
    <div className="flex items-center gap-2">
      <span className="text-base w-5 text-center">{emoji}</span>
      <div className="flex-1">
        <div className="flex justify-between text-[0.68rem] mb-0.5">
          <span className="text-text-mid">{label}</span>
          <span className="text-text-xlight">{display ?? '–'}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-teal-mid transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export function WellnessScore() {
  const [data, setData] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/wellness-score')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-[20px] p-5 shadow-card border border-teal-light/60 animate-pulse">
        <div className="flex gap-4 items-center mb-4">
          <div className="w-28 h-28 rounded-full bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-3 w-40 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { pwi, label, colour, components } = data

  const moodDisplay   = components.mood.value   !== null ? `${components.mood.value}/5`    : null
  const sleepDisplay  = components.sleep.value  !== null ? `${components.sleep.value}h`    : null
  const streakDisplay = `${components.streak.value}d`
  const habitDisplay  = components.habits.value !== null ? `${components.habits.value}%`   : null

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-card border border-teal-light/60">
      <p className="text-[0.68rem] font-bold text-teal-mid uppercase tracking-widest mb-4">
        🏅 Personal Wellness Index
      </p>

      <div className="flex gap-4 items-center mb-5">
        <CircleGauge score={pwi} colour={colour} />
        <div>
          <p className="font-display font-bold text-[1.1rem] text-charcoal leading-tight">{label}</p>
          <p className="text-[0.75rem] text-text-xlight mt-1 leading-relaxed">
            Based on your last 7 days of mood, sleep, streak &amp; habits.
          </p>
          <Link href="/mood" className="mt-2 inline-block text-[0.75rem] font-semibold text-teal-mid hover:text-teal-deep no-underline transition-colors">
            Improve score →
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        <ComponentRow emoji="😊" label="Mood"   score={components.mood.score}   max={25} display={moodDisplay}   />
        <ComponentRow emoji="🌙" label="Sleep"  score={components.sleep.score}  max={25} display={sleepDisplay}  />
        <ComponentRow emoji="🔥" label="Streak" score={components.streak.score} max={25} display={streakDisplay} />
        <ComponentRow emoji="✅" label="Habits" score={components.habits.score} max={25} display={habitDisplay}  />
      </div>

      {/* Personal bests — self-comparison only, always celebratory */}
      {(data.personalBests?.length ?? 0) > 0 && (
        <div className="mt-4 pt-4 border-t border-teal-light/40">
          <p className="text-[0.62rem] font-bold text-amber uppercase tracking-widest mb-2">🏆 Personal Bests</p>
          <div className="space-y-1.5">
            {data.personalBests!.map((b, i) => (
              <p key={i} className="text-[0.78rem] text-charcoal font-medium leading-snug">{b}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
