'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Suggestion {
  id: number
  name: string
  avatarUrl: string | null
  interests: string
  currentStreak: number
  badges: number
  matchReason: string
}

export function BuddySuggestions() {
  const { status } = useSession()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    setLoading(true)
    fetch('/api/buddy-suggestions')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.suggestions?.length) setSuggestions(d.suggestions) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status])

  if (status !== 'authenticated' || loading || !suggestions.length) return null

  return (
    <div className="mt-8 bg-gradient-to-br from-teal-ghost via-white to-amber-pale/30 border border-teal-light rounded-[24px] p-6">
      <p className="text-[0.72rem] font-bold text-teal-mid uppercase tracking-widest mb-1">People Like You</p>
      <p className="text-charcoal font-display font-bold text-[1.05rem] mb-4">Wellness Buddies ✨</p>
      <div className="space-y-3">
        {suggestions.map(s => (
          <Link key={s.id} href={`/profile/${s.id}`}
            className="flex items-center gap-4 p-3.5 rounded-[16px] bg-white border border-teal-light/60 hover:border-teal-mid hover:shadow-card transition-all no-underline group">

            {/* Avatar */}
            {s.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.avatarUrl} alt={s.name} referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-mid to-teal-deep flex items-center justify-center text-white font-bold text-[1rem] flex-shrink-0">
                {s.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-charcoal text-[0.9rem] group-hover:text-teal-deep transition-colors truncate">{s.name}</p>
              <p className="text-text-xlight text-[0.73rem] truncate">{s.matchReason}</p>
            </div>

            <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
              {s.currentStreak > 0 && (
                <span className="text-[0.68rem] text-amber font-bold">🔥 {s.currentStreak}d</span>
              )}
              {s.badges > 0 && (
                <span className="text-[0.68rem] text-teal-deep font-medium">🏅 {s.badges}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
      <p className="text-[0.72rem] text-text-xlight mt-3 text-center">
        Matched by shared challenges and interests · <Link href="/community" className="text-teal-mid underline-offset-2 underline">visit community wall</Link>
      </p>
    </div>
  )
}
