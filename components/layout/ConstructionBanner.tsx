'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export function ConstructionBanner() {
  const { data: session } = useSession()
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid flash
  const [email,     setEmail]     = useState('')
  const [status,    setStatus]    = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  useEffect(() => {
    // Hide for logged-in users or if already dismissed
    if (session) { setDismissed(true); return }
    const hidden = localStorage.getItem('ltp-banner-dismissed')
    if (!hidden) setDismissed(false)
  }, [session])

  function dismiss() {
    localStorage.setItem('ltp-banner-dismissed', '1')
    setDismissed(true)
  }

  async function subscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      })
      const ct = res.headers.get('content-type') ?? ''
      if (!ct.includes('application/json')) { setStatus('error'); return }
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (dismissed) return null

  return (
    <div className="w-full bg-gradient-to-r from-teal-deep via-[#1a6b6b] to-teal-dark text-white shadow-md">
      {/* Marquee row */}
      <div className="overflow-hidden border-b border-white/10 py-1.5 relative">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-[0.78rem] font-medium tracking-wide mx-8 flex-shrink-0">
              🚧 &nbsp;letsthinkpositive.com is currently under construction &nbsp;·&nbsp;
              Launching soon with full features &nbsp;·&nbsp;
              Thank you for visiting — we&apos;re almost ready! &nbsp;·&nbsp;
              🌿 &nbsp;Sign up now to be notified on launch day &nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Subscribe + sign-in row */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5">
        {/* Left label */}
        <p className="text-[0.82rem] font-semibold text-white/90 flex items-center gap-2 flex-shrink-0">
          <span>🌱</span>
          <span className="hidden sm:inline">Be the first to know when we launch</span>
          <span className="sm:hidden">Notify me on launch</span>
        </p>

        {/* Centre — subscribe form */}
        <div className="flex-1 min-w-0 max-w-sm">
          {status === 'done' ? (
            <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2">
              <span className="text-[0.82rem] font-semibold">✅ You&apos;re on the list! We&apos;ll email you on launch day 🎉</span>
            </div>
          ) : (
            <form onSubmit={subscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 min-w-0 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-[0.82rem] placeholder-white/50 text-white outline-none focus:border-white/60 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-amber text-charcoal px-4 py-1.5 rounded-full text-[0.8rem] font-bold flex-shrink-0 hover:bg-amber-soft transition-colors disabled:opacity-60 whitespace-nowrap">
                {status === 'loading' ? '…' : 'Notify me →'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="text-[0.72rem] text-red-300 mt-1 pl-2">Something went wrong — please try again.</p>
          )}
        </div>

        {/* Right — sign in + close */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/login"
            className="text-[0.8rem] font-semibold text-white/90 border border-white/30 px-4 py-1.5 rounded-full hover:bg-white/10 transition-colors no-underline whitespace-nowrap">
            Sign in
          </Link>
          <button
            onClick={dismiss}
            aria-label="Dismiss banner"
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white text-[1rem] leading-none flex-shrink-0">
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
