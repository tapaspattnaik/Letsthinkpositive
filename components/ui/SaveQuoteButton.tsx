'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Props {
  text: string
  attribution?: string
  source?: string
  size?: 'sm' | 'md'
}

export function SaveQuoteButton({ text, attribution, source = 'feed', size = 'sm' }: Props) {
  const { data: session } = useSession()
  const [saved,   setSaved]   = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [showTip, setShowTip] = useState(false)

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()

    if (!session) { setShowTip(true); setTimeout(() => setShowTip(false), 3000); return }
    if (saved) return  // already saved — show profile link instead

    setSaving(true)
    const res = await fetch('/api/saved-quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, attribution, source }),
    })
    setSaving(false)
    if (res.ok || res.status === 409) setSaved(true)
  }

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <div className="relative inline-flex">
      <button
        onClick={toggle}
        title={saved ? 'Saved to your profile' : 'Save quote'}
        aria-label={saved ? 'Quote saved' : 'Save this quote'}
        disabled={saving}
        className={`flex items-center gap-1.5 transition-all rounded-full px-2.5 py-1.5 text-[0.72rem] font-semibold
          ${saved
            ? 'text-amber bg-amber/15 border border-amber/30'
            : 'text-text-xlight hover:text-amber hover:bg-amber/10 border border-transparent hover:border-amber/20'}`}>
        <svg
          className={`${iconSize} transition-transform ${saving ? 'animate-pulse' : saved ? 'scale-110' : ''}`}
          fill={saved ? 'currentColor' : 'none'}
          viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
        {saved ? 'Saved' : size === 'md' ? 'Save' : ''}
      </button>

      {/* Saved — link to profile */}
      {saved && (
        <Link href="/profile"
          onClick={e => e.stopPropagation()}
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[0.65rem] px-2.5 py-1 rounded-lg whitespace-nowrap no-underline font-medium shadow-lg pointer-events-auto z-10">
          View in profile →
        </Link>
      )}

      {/* Sign-in tip */}
      {showTip && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[0.65rem] px-2.5 py-1.5 rounded-lg whitespace-nowrap z-10 shadow-lg">
          <Link href="/login" className="text-amber no-underline font-semibold">Sign in</Link>
          {' '}to save quotes
        </div>
      )}
    </div>
  )
}
