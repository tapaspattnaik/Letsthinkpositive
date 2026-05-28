'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Intention {
  id:         number
  word:       string
  intention:  string
  kindness:   string
  reflection: string | null
  date:       string
  createdAt:  string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function tomorrowStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function IntentionPage() {
  const { data: session, status } = useSession()

  const [intention,   setIntention]   = useState<Intention | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [copied,      setCopied]      = useState(false)
  const [showTomorrow, setShowTomorrow] = useState(false)

  // Form state
  const [word,      setWord]      = useState('')
  const [goal,      setGoal]      = useState('')
  const [kindness,  setKindness]  = useState('')
  const [wordError, setWordError] = useState('')

  // Reflection state
  const [reflectionText,   setReflectionText]   = useState('')
  const [savingReflection, setSavingReflection] = useState(false)

  // ── Fetch today's intention (only for signed-in users) ──────────────────
  const fetchIntention = useCallback(async () => {
    if (status === 'loading') return
    if (!session?.user) { setLoading(false); return }

    try {
      const res  = await fetch('/api/intention')
      const data = await res.json()
      setIntention(data.intention)
    } catch {
      // ignore — show the form
    } finally {
      setLoading(false)
    }
  }, [session, status])

  useEffect(() => { fetchIntention() }, [fetchIntention])

  // ── Submit form ─────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setWordError('')

    if (word.trim().includes(' ')) {
      setWordError('Please enter a single word only')
      return
    }

    if (!session?.user) {
      // Guest — store in local state only
      setIntention({
        id: 0, word: word.trim(), intention: goal.trim(),
        kindness: kindness.trim(), reflection: null,
        date: todayStr(), createdAt: new Date().toISOString(),
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/intention', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ word: word.trim(), intention: goal.trim(), kindness: kindness.trim() }),
      })
      const data = await res.json()
      if (res.ok) setIntention(data.intention)
    } finally {
      setSaving(false)
    }
  }

  // ── Save reflection ─────────────────────────────────────────────────────
  async function handleSaveReflection() {
    if (!reflectionText.trim()) return
    setSavingReflection(true)
    try {
      const res = await fetch('/api/intention', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ reflection: reflectionText.trim() }),
      })
      const data = await res.json()
      if (res.ok) setIntention(data.intention)
    } finally {
      setSavingReflection(false)
    }
  }

  // ── Copy share text ─────────────────────────────────────────────────────
  function handleCopy() {
    if (!intention) return
    const text = [
      `My intention for ${formatDate(intention.date)}:`,
      ``,
      `Word:     ${intention.word}`,
      `Goal:     ${intention.intention}`,
      `Kindness: ${intention.kindness}`,
      intention.reflection ? `\nReflection: ${intention.reflection}` : '',
      ``,
      `Set yours at letsthinkpositive.com/intention`,
    ].join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  // ── Reset for tomorrow ──────────────────────────────────────────────────
  function handleSetTomorrow() {
    // Simply clear UI — tomorrow the API will return null and show the form
    setShowTomorrow(true)
  }

  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-pale flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── State B — intention exists (and we're not previewing tomorrow) ───────
  if (intention && !showTomorrow) {
    return <IntentionCard intention={intention} onCopy={handleCopy} copied={copied}
      reflectionText={reflectionText} setReflectionText={setReflectionText}
      savingReflection={savingReflection} onSaveReflection={handleSaveReflection}
      onSetTomorrow={handleSetTomorrow} isGuest={!session?.user} />
  }

  // ── State A — form ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-pale via-[#fffbf2] to-ivory px-4 py-16">
      <div className="max-w-xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber/10 text-amber px-4 py-1.5 rounded-full text-sm font-body font-medium mb-5">
            <span>🌅</span>
            <span>{formatDate(showTomorrow ? tomorrowStr() : todayStr())}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-charcoal leading-tight mb-3">
            Set Your Intention<br />
            <span className="italic text-amber">for Today</span>
          </h1>
          <p className="font-body text-text-light text-lg max-w-sm mx-auto leading-relaxed">
            Three questions. Thirty seconds.<br />A day with more direction.
          </p>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit}
          className="bg-white rounded-[28px] shadow-lift px-8 py-10 space-y-8">

          {/* Field 1 — one word */}
          <div className="text-center">
            <label className="block font-body text-sm font-semibold text-text-mid uppercase tracking-widest mb-4">
              One word for today
            </label>
            <div className="flex justify-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* decorative circle */}
                <div className="absolute inset-0 rounded-full border-2 border-amber/30 bg-amber-pale" />
                <input
                  value={word}
                  onChange={e => { setWord(e.target.value.replace(/\s/g, '')); setWordError('') }}
                  placeholder="Brave"
                  maxLength={30}
                  required
                  className="relative z-10 w-36 text-center text-2xl font-display font-semibold text-charcoal
                             bg-transparent border-b-2 border-amber/40 focus:border-amber outline-none
                             placeholder:text-amber/30 tracking-wide"
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-text-xlight font-body">
              e.g. Brave, Calm, Present, Focused, Bold
            </p>
            {wordError && <p className="mt-1 text-xs text-red-500">{wordError}</p>}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-amber/15" />
            <span className="text-amber/40 text-xs">✦</span>
            <div className="flex-1 h-px bg-amber/15" />
          </div>

          {/* Field 2 — one thing to do */}
          <div>
            <label className="block font-body text-sm font-semibold text-text-mid mb-2">
              One thing I want to do
            </label>
            <input
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g. Finish the project report without checking my phone"
              maxLength={200}
              required
              className="w-full px-4 py-3 rounded-2xl border border-amber/20 bg-amber-pale/40
                         font-body text-charcoal placeholder:text-text-xlight
                         focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber/50
                         transition"
            />
          </div>

          {/* Field 3 — one act of kindness */}
          <div>
            <label className="block font-body text-sm font-semibold text-text-mid mb-2">
              One person I&apos;ll show kindness to
            </label>
            <input
              value={kindness}
              onChange={e => setKindness(e.target.value)}
              placeholder="e.g. My colleague who seems stressed, or a stranger"
              maxLength={200}
              required
              className="w-full px-4 py-3 rounded-2xl border border-amber/20 bg-amber-pale/40
                         font-body text-charcoal placeholder:text-text-xlight
                         focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber/50
                         transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-teal-deep text-white font-body font-semibold rounded-full
                       hover:bg-teal-dark active:scale-[0.98] transition-all duration-150
                       disabled:opacity-60 disabled:cursor-not-allowed text-base tracking-wide"
          >
            {saving ? 'Setting…' : 'Set my intention →'}
          </button>

          {/* Guest note */}
          {!session?.user && status !== 'loading' && (
            <p className="text-center text-xs text-text-xlight font-body pt-1 leading-relaxed">
              You can still set an intention — it won&apos;t be saved between sessions.{' '}
              <Link href="/login" className="text-teal-mid hover:underline">Sign in</Link> to keep a history.
            </p>
          )}
        </form>

        {/* Quiet bottom nudge */}
        <p className="text-center text-xs text-text-xlight font-body mt-8 leading-relaxed">
          Your intentions are private. Only you can see them.
        </p>
      </div>
    </div>
  )
}

// ─── Intention Card (State B) ─────────────────────────────────────────────────

interface CardProps {
  intention:          Intention
  onCopy:             () => void
  copied:             boolean
  reflectionText:     string
  setReflectionText:  (v: string) => void
  savingReflection:   boolean
  onSaveReflection:   () => void
  onSetTomorrow:      () => void
  isGuest:            boolean
}

function IntentionCard({
  intention, onCopy, copied,
  reflectionText, setReflectionText, savingReflection, onSaveReflection,
  onSetTomorrow, isGuest,
}: CardProps) {
  const isToday = intention.date === todayStr()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-pale via-[#fffbf2] to-ivory px-4 py-14">
      <div className="max-w-xl mx-auto">

        {/* Date chip */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber/10 text-amber px-4 py-1.5 rounded-full text-sm font-body font-medium">
            <span>🌅</span>
            <span>{formatDate(intention.date)}</span>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-[28px] shadow-lift overflow-hidden">

          {/* Word hero */}
          <div className="bg-gradient-to-br from-amber-pale to-[#fdf3d8] px-8 pt-10 pb-8 text-center">
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-amber mb-4">
              Today&apos;s word
            </p>
            <div className="inline-flex items-center justify-center w-40 h-40 rounded-full
                            border-2 border-amber/30 bg-white/70 shadow-md mb-2">
              <span className="font-display text-4xl font-bold italic text-charcoal tracking-wide">
                {intention.word}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="px-8 py-8 space-y-5">
            <IntentionLine icon="🎯" label="Today I will" value={intention.intention} />
            <IntentionLine icon="💛" label="I'll show kindness to" value={intention.kindness} />
          </div>

          {/* Divider */}
          <div className="mx-8 h-px bg-amber/10" />

          {/* Evening reflection */}
          <div className="px-8 py-7">
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-text-xlight mb-4">
              Evening check-in
            </p>

            {intention.reflection ? (
              <blockquote className="bg-amber-pale/60 border-l-4 border-amber/40 rounded-r-2xl px-5 py-4">
                <p className="font-body text-text-mid text-sm leading-relaxed italic">
                  &ldquo;{intention.reflection}&rdquo;
                </p>
              </blockquote>
            ) : isGuest ? (
              <p className="text-sm text-text-xlight font-body italic">
                Sign in to save your evening reflection.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="font-body text-sm text-text-light leading-relaxed">
                  How did your intention go today?
                </p>
                <textarea
                  value={reflectionText}
                  onChange={e => setReflectionText(e.target.value)}
                  rows={3}
                  maxLength={300}
                  placeholder="A small win, a moment you noticed, or just how it felt…"
                  className="w-full px-4 py-3 rounded-2xl border border-amber/20 bg-amber-pale/30
                             font-body text-sm text-charcoal placeholder:text-text-xlight resize-none
                             focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber/50
                             transition"
                />
                <button
                  onClick={onSaveReflection}
                  disabled={savingReflection || !reflectionText.trim()}
                  className="px-6 py-2.5 bg-amber/90 text-white font-body font-semibold text-sm
                             rounded-full hover:bg-amber active:scale-[0.97] transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingReflection ? 'Saving…' : 'Save reflection'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-amber/30
                       bg-white text-text-mid font-body text-sm font-medium hover:border-amber/60
                       hover:bg-amber-pale transition-all"
          >
            <span>{copied ? '✓' : '🔗'}</span>
            {copied ? 'Copied!' : 'Share intention'}
          </button>

          {isToday && (
            <button
              onClick={onSetTomorrow}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-teal-ghost
                         text-teal-deep font-body text-sm font-medium hover:bg-teal-light/30
                         transition-all"
            >
              <span>🌙</span>
              Set tomorrow&apos;s intention
            </button>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/journal" className="text-xs text-text-xlight font-body hover:text-teal-mid transition">
            See your journal →
          </Link>
        </div>
      </div>
    </div>
  )
}

function IntentionLine({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-lg mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-text-xlight mb-0.5">
          {label}
        </p>
        <p className="font-body text-base text-charcoal leading-snug">{value}</p>
      </div>
    </div>
  )
}
