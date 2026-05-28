'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface GratitudeEntry {
  id: number
  name: string
  content: string
  hearts: number
  createdAt: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

const CARD_BACKGROUNDS = [
  'bg-[#EEF7F6]',           // teal-ghost
  'bg-[#FFF8EC]',           // amber-pale
  'bg-[#F0FAF9]',           // lighter teal
  'bg-[#FFFBF2]',           // softer amber
]

export default function GratitudeWallPage() {
  const [entries, setEntries]         = useState<GratitudeEntry[]>([])
  const [total, setTotal]             = useState(0)
  const [date, setDate]               = useState('')
  const [loading, setLoading]         = useState(true)
  const [visibleCount, setVisible]    = useState(20)

  // Form state
  const [content, setContent]         = useState('')
  const [name, setName]               = useState('')
  const [anonymous, setAnonymous]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [success, setSuccess]         = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Optimistic hearts: { [id]: localHearts }
  const [heartedIds, setHeartedIds]   = useState<Set<number>>(new Set())
  const [localHearts, setLocalHearts] = useState<Record<number, number>>({})

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchEntries = useCallback(async () => {
    try {
      const res  = await fetch('/api/gratitude-wall', { cache: 'no-store' })
      const data = await res.json()
      if (data.entries) {
        setEntries(data.entries)
        setTotal(data.total)
        setDate(data.date)
      }
    } catch {
      // silently ignore refresh errors
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntries()
    intervalRef.current = setInterval(fetchEntries, 30000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchEntries])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res  = await fetch('/api/gratitude-wall', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ content, name: name.trim() || undefined, anonymous }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error ?? 'Something went wrong')
        return
      }
      setContent('')
      setName('')
      setAnonymous(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
      // Prepend the new entry optimistically
      if (data.entry) {
        setEntries(prev => [data.entry, ...prev])
        setTotal(prev => prev + 1)
      }
    } catch {
      setSubmitError('Could not post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleHeart(id: number, currentHearts: number) {
    if (heartedIds.has(id)) return
    // Optimistic update
    setHeartedIds(prev => new Set(prev).add(id))
    setLocalHearts(prev => ({ ...prev, [id]: (prev[id] ?? currentHearts) + 1 }))
    try {
      const res  = await fetch(`/api/gratitude-wall/${id}/heart`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && typeof data.hearts === 'number') {
        setLocalHearts(prev => ({ ...prev, [id]: data.hearts }))
      }
    } catch {
      // Keep optimistic value on error
    }
  }

  const charCount    = content.length
  const charLeft     = 280 - charCount
  const visibleItems = entries.slice(0, visibleCount)
  const hasMore      = entries.length > visibleCount

  return (
    <div className="min-h-screen" style={{ background: 'var(--ivory)' }}>

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden py-16 px-4 text-center"
        style={{
          background: 'linear-gradient(135deg, #0F4040 0%, #1A6B6B 40%, #E8A020 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div
          className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #F5C96A 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-10 -right-10 w-56 h-56 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #A8D8D0 0%, transparent 70%)' }}
        />

        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#F5C96A]">
          Daily · Public · Free
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
          Today&apos;s Gratitude Wall 🙏
        </h1>
        <p className="text-[#A8D8D0] text-lg mb-3 max-w-xl mx-auto">
          A warm, open space to share one thing you&apos;re grateful for today.
          Every entry matters.
        </p>

        {/* Live counter */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#F5C96A', backdropFilter: 'blur(8px)' }}>
          <span className="inline-block w-2 h-2 rounded-full bg-[#F5C96A] animate-pulse" />
          {loading ? '—' : total}{' '}
          {total === 1 ? 'person is' : 'people are'} grateful today
        </div>

        {date && (
          <p className="mt-3 text-sm text-[#A8D8D0] opacity-80">
            {formatDate(date + 'T00:00:00')}
          </p>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* ── Submit form ── */}
        <div
          className="rounded-2xl p-6 shadow-lg border"
          style={{
            background: 'white',
            borderColor: 'rgba(168,216,208,0.4)',
            boxShadow: '0 4px 24px rgba(26,107,107,0.10)',
          }}
        >
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--teal-dark)' }}>
            Share your gratitude
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--teal-deep)' }}>
            What&apos;s one thing you&apos;re grateful for today?
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Textarea */}
            <div className="relative">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value.slice(0, 280))}
                placeholder="I'm grateful for..."
                rows={3}
                className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: 'var(--teal-ghost)',
                  border: '1.5px solid transparent',
                  color: 'var(--charcoal)',
                  fontFamily: 'inherit',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--teal-mid)')}
                onBlur={e  => (e.currentTarget.style.borderColor = 'transparent')}
                required
              />
              <span
                className="absolute bottom-2.5 right-3 text-xs select-none"
                style={{ color: charLeft <= 20 ? 'var(--amber)' : 'var(--teal-mid)' }}
              >
                {charLeft}
              </span>
            </div>

            {/* Name field — hidden when anonymous */}
            {!anonymous && (
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value.slice(0, 100))}
                placeholder="Your name (optional)"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                style={{
                  background: 'var(--teal-ghost)',
                  border: '1.5px solid transparent',
                  color: 'var(--charcoal)',
                  fontFamily: 'inherit',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--teal-mid)')}
                onBlur={e  => (e.currentTarget.style.borderColor = 'transparent')}
              />
            )}

            {/* Anonymous toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
              <span
                className="relative inline-flex items-center w-9 h-5 rounded-full transition-colors"
                style={{ background: anonymous ? 'var(--teal-mid)' : 'var(--teal-light)' }}
              >
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={e => setAnonymous(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className="absolute w-3.5 h-3.5 bg-white rounded-full shadow transition-transform"
                  style={{ transform: anonymous ? 'translateX(18px)' : 'translateX(3px)' }}
                />
              </span>
              <span className="text-sm" style={{ color: 'var(--teal-deep)' }}>
                Post anonymously
              </span>
            </label>

            {/* Error */}
            {submitError && (
              <p className="text-sm text-red-500">{submitError}</p>
            )}

            {/* Success */}
            {success && (
              <p
                className="text-sm font-medium px-4 py-2.5 rounded-xl"
                style={{ background: '#E6F7F4', color: 'var(--teal-deep)' }}
              >
                Your gratitude has been added 🌿
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: submitting ? 'var(--teal-deep)' : 'var(--teal-dark)',
                color: 'white',
              }}
              onMouseEnter={e => { if (!submitting) (e.currentTarget.style.background = 'var(--teal-deep)') }}
              onMouseLeave={e => { if (!submitting) (e.currentTarget.style.background = 'var(--teal-dark)') }}
            >
              {submitting ? 'Posting...' : 'Add to the wall 🙏'}
            </button>
          </form>
        </div>

        {/* ── Feed ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold" style={{ color: 'var(--teal-dark)' }}>
              On the wall today
            </h2>
            {!loading && total > 0 && (
              <span className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ background: 'var(--teal-ghost)', color: 'var(--teal-deep)' }}>
                {total} {total === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </div>

          {loading ? (
            /* Skeleton */
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl p-5 animate-pulse"
                  style={{ background: 'var(--teal-ghost)', minHeight: 96 }}>
                  <div className="h-3 w-3/4 rounded-full mb-3" style={{ background: 'var(--teal-light)' }} />
                  <div className="h-3 w-1/2 rounded-full" style={{ background: 'var(--teal-light)' }} />
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            /* Empty state */
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🌱</p>
              <p className="font-semibold mb-1" style={{ color: 'var(--teal-dark)' }}>
                Be the first to share your gratitude today
              </p>
              <p className="text-sm" style={{ color: 'var(--teal-deep)' }}>
                It only takes a moment, and it might brighten someone&apos;s day.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleItems.map((entry, idx) => {
                const bg        = CARD_BACKGROUNDS[idx % CARD_BACKGROUNDS.length]
                const hearts    = localHearts[entry.id] ?? entry.hearts
                const hearted   = heartedIds.has(entry.id)
                const isAmber   = idx % 4 === 1 || idx % 4 === 3

                return (
                  <article
                    key={entry.id}
                    className={`${bg} rounded-2xl p-5 transition-shadow hover:shadow-md`}
                    style={{ borderLeft: `3px solid ${isAmber ? 'var(--amber-soft)' : 'var(--teal-light)'}` }}
                  >
                    {/* Content */}
                    <p
                      className="text-base italic leading-relaxed mb-4"
                      style={{
                        color: 'var(--charcoal)',
                        fontFamily: 'Georgia, "Times New Roman", serif',
                      }}
                    >
                      &ldquo;{entry.content}&rdquo;
                    </p>

                    {/* Footer row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: isAmber ? 'var(--amber-soft)' : 'var(--teal-light)',
                            color: isAmber ? 'var(--teal-dark)' : 'var(--teal-dark)',
                          }}
                        >
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold leading-none" style={{ color: 'var(--teal-dark)' }}>
                            {entry.name}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--teal-deep)', opacity: 0.7 }}>
                            {timeAgo(entry.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Heart button */}
                      <button
                        onClick={() => handleHeart(entry.id, entry.hearts)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-90"
                        style={{
                          background:  hearted ? '#FEE2E2' : 'rgba(255,255,255,0.7)',
                          color:       hearted ? '#E84040' : 'var(--teal-deep)',
                          border:      `1px solid ${hearted ? '#FECACA' : 'rgba(168,216,208,0.5)'}`,
                          cursor:      hearted ? 'default' : 'pointer',
                        }}
                        aria-label={hearted ? `${hearts} hearts` : `Heart this entry (${hearts})`}
                      >
                        <span style={{ fontSize: 14 }}>{hearted ? '❤️' : '🤍'}</span>
                        <span>{hearts}</span>
                      </button>
                    </div>
                  </article>
                )
              })}

              {/* Load more */}
              {hasMore && (
                <button
                  onClick={() => setVisible(v => v + 20)}
                  className="w-full py-3 rounded-2xl text-sm font-semibold transition-all"
                  style={{
                    background: 'var(--teal-ghost)',
                    color: 'var(--teal-deep)',
                    border: '1.5px solid var(--teal-light)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--teal-light)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--teal-ghost)')}
                >
                  Load more ({entries.length - visibleCount} remaining)
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Footer note ── */}
        <p className="text-center text-xs pb-6" style={{ color: 'var(--teal-mid)', opacity: 0.7 }}>
          This wall refreshes every 30 seconds · Entries reset daily at midnight
        </p>
      </div>
    </div>
  )
}
