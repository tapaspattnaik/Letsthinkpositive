'use client'

import { useEffect, useState } from 'react'

interface CorrelationData {
  hasData: boolean
  message?: string
  pairCount?: number
  overallSleepAvg?: number
  overallMoodAvg?: number
  goodSleepCount?: number
  poorSleepCount?: number
  avgMoodGoodSleep?: number | null
  avgMoodPoorSleep?: number | null
  moodDiff?: number | null
  insight?: string
}

function MoodBar({ label, value, max = 5, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div>
      <div className="flex justify-between text-[0.72rem] mb-1">
        <span className="text-text-mid font-medium">{label}</span>
        <span className="font-bold text-charcoal">{value}/5</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function MoodSleepCard() {
  const [data, setData] = useState<CorrelationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/ai-correlation')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-[20px] p-5 shadow-card border border-teal-light/60 animate-pulse">
        <div className="h-4 w-40 bg-gray-100 rounded mb-4" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-gray-100 rounded" />
          <div className="h-3 w-4/5 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  if (!data) return null

  // Not enough data yet — show an encouraging nudge
  if (!data.hasData) {
    return (
      <div className="bg-indigo-50 border border-indigo-100 rounded-[20px] p-5">
        <p className="text-[0.68rem] font-bold text-indigo-400 uppercase tracking-widest mb-2">🔬 Mood × Sleep</p>
        <p className="text-[0.82rem] text-text-mid leading-relaxed">{data.message}</p>
      </div>
    )
  }

  const hasBothBands = data.avgMoodGoodSleep !== null && data.avgMoodPoorSleep !== null
  const strongCorr = (data.moodDiff ?? 0) >= 0.5

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-card border border-teal-light/60">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[0.7rem] font-bold text-teal-mid uppercase tracking-widest">🔬 Mood × Sleep</p>
        <span className="text-[0.65rem] bg-teal-ghost text-teal-deep px-2 py-0.5 rounded-full font-semibold">
          {data.pairCount} days
        </span>
      </div>

      {hasBothBands && (
        <div className="space-y-3 mb-4">
          <MoodBar
            label={`7 h+ sleep (${data.goodSleepCount} days)`}
            value={data.avgMoodGoodSleep!}
            color="bg-teal-mid"
          />
          <MoodBar
            label={`< 7 h sleep (${data.poorSleepCount} days)`}
            value={data.avgMoodPoorSleep!}
            color="bg-indigo-300"
          />
        </div>
      )}

      {/* Summary stat */}
      {strongCorr && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-amber text-base">⚡</span>
          <p className="text-[0.75rem] font-semibold text-charcoal">
            Sleep boosts your mood by <span className="text-teal-deep">{data.moodDiff} pts</span>
          </p>
        </div>
      )}

      {/* AI insight */}
      {data.insight && (
        <p className="text-[0.78rem] italic text-text-mid leading-relaxed border-t border-gray-100 pt-3 mt-1">
          ✨ {data.insight}
        </p>
      )}
    </div>
  )
}
