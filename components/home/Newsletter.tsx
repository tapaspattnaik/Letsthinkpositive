'use client'

import { useState } from 'react'

export function Newsletter() {
  const [email,   setEmail]   = useState('')
  const [name,    setName]    = useState('')
  const [done,    setDone]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/newsletter', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, name: name.trim() || undefined }),
      })
      // Guard against HTML error pages (503, 500) being returned instead of JSON
      const contentType = res.headers.get('content-type') ?? ''
      if (!contentType.includes('application/json')) {
        throw new Error('Server is temporarily unavailable. Please try again in a moment.')
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-amber-pale py-20 px-[5%]">
      <div className="max-w-[600px] mx-auto text-center">
        <div className="flex items-center justify-center gap-3 text-teal-mid text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4 section-label">
          Stay Connected
        </div>
        <h2 className="font-display text-[clamp(1.9rem,3vw,2.8rem)] text-charcoal leading-snug mb-3">
          One thought a day. <em className="text-teal-deep italic">That&apos;s all it takes.</em>
        </h2>
        <p className="text-text-light mb-0 text-[1rem] leading-[1.8]">
          Sign up and every morning you&apos;ll receive one daily quote delivered quietly to your inbox. No noise. No spam. Just one thought to carry with you into your day.
        </p>

        {done ? (
          <div className="mt-8 bg-teal-ghost border border-teal-light rounded-[24px] p-6 text-teal-deep font-medium">
            🌱 Welcome aboard! Your first thought arrives tomorrow morning.
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-8 bg-white rounded-full flex gap-2 p-1.5 pl-5 shadow-card">
              <input
                type="text" placeholder="Your first name" value={name} onChange={e => setName(e.target.value)}
                disabled={loading}
                className="flex-1 border-none outline-none font-body text-[0.95rem] text-charcoal bg-transparent placeholder:text-text-xlight disabled:opacity-60"
              />
              <input
                type="email" placeholder="Your email address" required value={email} onChange={e => setEmail(e.target.value)}
                disabled={loading}
                className="flex-1 border-none outline-none font-body text-[0.95rem] text-charcoal bg-transparent placeholder:text-text-xlight disabled:opacity-60"
              />
              <button type="submit" disabled={loading}
                className="bg-teal-deep text-white rounded-full px-6 py-3 font-body font-semibold text-[0.9rem] whitespace-nowrap hover:bg-teal-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? 'Subscribing…' : 'Subscribe ☀️'}
              </button>
            </form>
            {error && (
              <p className="mt-3 text-[0.85rem] text-red-500">{error}</p>
            )}
          </>
        )}

        <p className="text-[0.8rem] text-text-xlight mt-4">Join readers from across India and the world. Unsubscribe anytime.</p>
      </div>
    </section>
  )
}
