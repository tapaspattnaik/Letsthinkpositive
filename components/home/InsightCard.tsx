'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface InsightData {
  insight: string
  moodAvg: number | null
  sleepAvg: number | null
  streakDays: number | null
  habitRate: number | null
  week: string
  isNew: boolean
}

function StatPill({
  emoji,
  label,
  value,
}: {
  emoji: string
  label: string
  value: string | null
}) {
  if (value === null) return null
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-teal-100">
      <span>{emoji}</span>
      <span className="font-medium text-white">{value}</span>
      <span className="opacity-70">{label}</span>
    </div>
  )
}

export function InsightCard() {
  const { status } = useSession()
  const [data, setData] = useState<InsightData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/ai-insight')
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.insight) setData(json)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status])

  // Not logged in or failed — render nothing (graceful degradation)
  if (status === 'unauthenticated') return null
  if (!loading && !data) return null

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-teal-900/60 to-teal-800/40 border border-teal-700/30 p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 rounded-full bg-amber-400/30" />
          <div className="h-4 w-32 rounded bg-white/10" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 w-full rounded bg-white/10" />
          <div className="h-3 w-5/6 rounded bg-white/10" />
          <div className="h-3 w-4/6 rounded bg-white/10" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-20 rounded-full bg-white/10" />
          <div className="h-7 w-20 rounded-full bg-white/10" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const moodValue = data.moodAvg !== null ? `${data.moodAvg}/5` : null
  const sleepValue = data.sleepAvg !== null ? `${data.sleepAvg}h` : null
  const streakValue = data.streakDays ? `${data.streakDays}d` : null
  const habitValue = data.habitRate !== null ? `${Math.round(data.habitRate * 100)}%` : null

  return (
    <div className="rounded-2xl bg-gradient-to-br from-teal-900/70 to-teal-800/50 border border-teal-600/30 p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <span className="text-sm font-semibold text-amber-300 tracking-wide uppercase">
            Your Weekly Insight
          </span>
        </div>
        {data.isNew && (
          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-400/30">
            NEW
          </span>
        )}
      </div>

      {/* AI Insight text */}
      <p className="text-sm leading-relaxed text-teal-50 mb-4">
        {data.insight}
      </p>

      {/* Stats row */}
      <div className="flex flex-wrap gap-2">
        <StatPill emoji="😊" label="mood" value={moodValue} />
        <StatPill emoji="🌙" label="sleep" value={sleepValue} />
        <StatPill emoji="🔥" label="streak" value={streakValue} />
        <StatPill emoji="✅" label="habits" value={habitValue} />
      </div>
    </div>
  )
}
