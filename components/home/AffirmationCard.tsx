'use client'

import { useEffect, useState } from 'react'

export function AffirmationCard() {
  const [text,         setText]         = useState<string | null>(null)
  const [personalised, setPersonalised] = useState(false)
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    fetch('/api/ai-affirmation')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.affirmation) {
          setText(d.affirmation)
          setPersonalised(d.personalised)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber/10 to-amber/5 border border-amber/20 px-5 py-4 animate-pulse">
        <div className="h-3 w-16 bg-amber/20 rounded mb-3" />
        <div className="h-4 w-full bg-amber/15 rounded mb-1" />
        <div className="h-4 w-3/4 bg-amber/15 rounded" />
      </div>
    )
  }

  if (!text) return null

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber/10 to-amber/5 border border-amber/25 px-5 py-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-amber text-base">☀️</span>
        <p className="text-[0.65rem] font-bold text-amber uppercase tracking-widest">
          Today's Affirmation
        </p>
        {personalised && (
          <span className="ml-auto text-[0.6rem] font-semibold text-amber/70 bg-amber/10 px-2 py-0.5 rounded-full">
            personalised
          </span>
        )}
      </div>
      <p className="font-display italic text-[1rem] text-charcoal leading-snug">
        &ldquo;{text}&rdquo;
      </p>
    </div>
  )
}
