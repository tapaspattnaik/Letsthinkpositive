'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// ── Gentle Mode banner ──────────────────────────────────────────────────────
// Shown when /api/gentle-mode detects a sustained low-mood stretch.
// Soft, zero-pressure support card — calm tools first, helpline last.
// Dismissable per-day (sessionStorage) so it never nags.

export function GentleBanner() {
  const { status } = useSession()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    // Respect today's dismissal
    const key = `ltp_gentle_dismissed_${new Date().toISOString().split('T')[0]}`
    try { if (sessionStorage.getItem(key)) return } catch { /* noop */ }

    fetch('/api/gentle-mode')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.gentle) setShow(true) })
      .catch(() => {})
  }, [status])

  if (!show) return null

  function dismiss() {
    setShow(false)
    try {
      const key = `ltp_gentle_dismissed_${new Date().toISOString().split('T')[0]}`
      sessionStorage.setItem(key, '1')
    } catch { /* noop */ }
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#eef6ff] to-[#f6f1ff] border border-indigo-100 p-5 relative">
      <button onClick={dismiss} aria-label="Dismiss"
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-indigo-300 hover:text-indigo-500 hover:bg-white/60 transition-colors text-[0.85rem]">
        ✕
      </button>

      <div className="flex items-start gap-3">
        <span className="text-[1.6rem] mt-0.5">💙</span>
        <div>
          <p className="font-display font-bold text-charcoal text-[0.98rem] mb-1">
            It looks like the last few days have been heavy.
          </p>
          <p className="text-text-mid text-[0.83rem] leading-relaxed mb-3.5">
            That&apos;s okay — rough patches are part of being human. There&apos;s nothing to
            keep up with today. If it helps, these are here for you:
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/breathing"
              className="inline-flex items-center gap-1.5 bg-white text-indigo-600 border border-indigo-200 hover:border-indigo-400 text-[0.78rem] font-semibold px-3.5 py-2 rounded-full no-underline transition-all">
              🌬️ Two calm minutes
            </Link>
            <Link href="/coach"
              className="inline-flex items-center gap-1.5 bg-white text-indigo-600 border border-indigo-200 hover:border-indigo-400 text-[0.78rem] font-semibold px-3.5 py-2 rounded-full no-underline transition-all">
              🌿 Talk it through
            </Link>
            <Link href="/sounds"
              className="inline-flex items-center gap-1.5 bg-white text-indigo-600 border border-indigo-200 hover:border-indigo-400 text-[0.78rem] font-semibold px-3.5 py-2 rounded-full no-underline transition-all">
              🎧 Soothing sounds
            </Link>
          </div>
          <p className="text-[0.7rem] text-indigo-300 mt-3 leading-relaxed">
            If you&apos;re struggling more than usual, talking to someone you trust — or a
            professional — is a sign of strength, not weakness.
          </p>
        </div>
      </div>
    </div>
  )
}
