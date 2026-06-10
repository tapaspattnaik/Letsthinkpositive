'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// ── Post-mood activity recommendations ───────────────────────────────────
const MOOD_ACTIONS: Record<number, { emoji: string; message: string; cta: string; href: string }[]> = {
  1: [
    { emoji: '💨', message: 'Box breathing can calm your nervous system in under 2 minutes.',            cta: 'Try breathing',    href: '/breathing'  },
    { emoji: '🎵', message: 'Soothing sounds can shift your mood gently without any effort.',           cta: 'Open sounds',      href: '/sounds'     },
    { emoji: '💬', message: 'The Calm Coach is here — share how you\'re feeling, no judgement.',        cta: 'Talk to coach',    href: '/coach'      },
  ],
  2: [
    { emoji: '🧘', message: 'A quick 5-minute meditation can ease the weight of a tough moment.',       cta: 'Meditate now',     href: '/meditation' },
    { emoji: '📓', message: 'Writing down even 3 words about your day can bring unexpected relief.',    cta: 'Open journal',     href: '/journal'    },
    { emoji: '💨', message: 'Try a simple breathing reset — it works even when nothing else does.',     cta: 'Breathe',          href: '/breathing'  },
  ],
  3: [
    { emoji: '📓', message: 'A steady mood is a great moment to journal and reflect.',                  cta: 'Journal now',      href: '/journal'    },
    { emoji: '🌿', message: 'Check in on your habits — even one small win today makes a difference.',   cta: 'View habits',      href: '/habits'     },
    { emoji: '📚', message: 'Explore a wellness article matched to what you care about.',               cta: 'Browse library',   href: '/library'    },
  ],
  4: [
    { emoji: '🏆', message: 'Great mood — this is the perfect energy to check in on your challenges.',  cta: 'Check challenges', href: '/challenges' },
    { emoji: '🌟', message: 'Share your positivity with the community — stories inspire others.',       cta: 'Share story',      href: '/community'  },
    { emoji: '💪', message: 'Strong energy? Log a habit or set a new one for the week.',               cta: 'Track habits',     href: '/habits'     },
  ],
  5: [
    { emoji: '🌟', message: 'You\'re thriving! Share what\'s going well — your story could inspire someone.', cta: 'Share with community', href: '/community' },
    { emoji: '🏆', message: 'Channel this great mood into a challenge check-in today.',                cta: 'Check in',         href: '/challenges' },
    { emoji: '📓', message: 'Capture what made today great — your future self will thank you.',        cta: 'Write it down',    href: '/journal'    },
  ],
}

function MoodActivitySuggestion({ mood }: { mood: number | null }) {
  if (!mood) return null
  const suggestions = MOOD_ACTIONS[mood] ?? []
  const pick = suggestions[Math.floor(Math.random() * suggestions.length)]
  if (!pick) return null

  return (
    <div className="mt-3 bg-amber-pale border border-amber/30 rounded-[14px] px-4 py-3.5">
      <p className="text-[0.65rem] font-bold text-amber uppercase tracking-widest mb-1.5">✨ Try this now</p>
      <p className="text-[0.85rem] text-charcoal leading-relaxed mb-3">{pick.emoji} {pick.message}</p>
      <Link
        href={pick.href}
        className="inline-block bg-teal-deep text-white text-[0.8rem] font-semibold px-5 py-2 rounded-full no-underline hover:bg-teal-dark transition-colors"
      >
        {pick.cta} →
      </Link>
    </div>
  )
}

interface MoodEntry {
  id:        number
  mood:      number
  note:      string | null
  date:      string
  createdAt: string
}

const MOODS = [
  { value: 1, emoji: '😔', label: 'Very Low',  color: '#ef4444', bg: 'bg-red-50',    border: 'border-red-200' },
  { value: 2, emoji: '😕', label: 'Low',        color: '#f97316', bg: 'bg-orange-50', border: 'border-orange-200' },
  { value: 3, emoji: '😐', label: 'Okay',       color: '#eab308', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { value: 4, emoji: '🙂', label: 'Good',       color: '#22c55e', bg: 'bg-green-50',  border: 'border-green-200' },
  { value: 5, emoji: '😄', label: 'Great',      color: '#0d9488', bg: 'bg-teal-50',   border: 'border-teal-200' },
]

function MoodBar({ entries }: { entries: MoodEntry[] }) {
  // Last 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })

  const map = Object.fromEntries(entries.map(e => [e.date, e.mood]))

  return (
    <div>
      <div className="flex gap-1 items-end h-16">
        {days.map(day => {
          const mood = map[day]
          const m    = mood ? MOODS[mood - 1] : null
          const h    = mood ? (mood / 5) * 100 : 0
          return (
            <div key={day} className="flex-1 flex flex-col items-center justify-end" title={`${day}${mood ? `: ${MOODS[mood-1].label}` : ''}`}>
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height:     `${Math.max(h, mood ? 10 : 2)}%`,
                  background: m ? m.color : '#e5f7f5',
                  opacity:    mood ? 1 : 0.3,
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-[0.65rem] text-text-xlight mt-1">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  )
}

function MoodAvatar({ avg }: { avg: number }) {
  const idx = Math.round(avg) - 1
  const m   = MOODS[Math.max(0, Math.min(4, idx))]
  return (
    <div className="text-center">
      <p className="text-[3rem] mb-1">{m.emoji}</p>
      <p className="font-bold text-charcoal">{avg.toFixed(1)}</p>
      <p className="text-text-xlight text-[0.78rem]">{m.label} avg</p>
    </div>
  )
}

export default function MoodPage() {
  const { data: session, status } = useSession()

  const [entries,    setEntries]    = useState<MoodEntry[]>([])
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState<number | null>(null)
  const [note,       setNote]       = useState('')
  const [saving,     setSaving]     = useState(false)
  const [savedToday, setSavedToday] = useState(false)
  const [todayMood,  setTodayMood]  = useState<MoodEntry | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res  = await fetch('/api/mood')
      const data = await res.json()
      if (Array.isArray(data)) {
        setEntries(data)
        const today = new Date().toISOString().split('T')[0]
        const te    = data.find((e: MoodEntry) => e.date === today)
        if (te) { setTodayMood(te); setSelected(te.mood); setNote(te.note ?? '') }
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => {
    if (status === 'authenticated') load()
    else if (status === 'unauthenticated') setLoading(false)
  }, [status])

  async function saveMood() {
    if (!selected) return
    setSaving(true)
    const res  = await fetch('/api/mood', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ mood: selected, note: note || null }),
    })
    const data = await res.json()
    if (res.ok) {
      setSavedToday(true)
      setTodayMood(data)
      setEntries(prev => {
        const today = data.date
        return [data, ...prev.filter(e => e.date !== today)]
      })
    }
    setSaving(false)
  }

  const avg = entries.length > 0
    ? entries.slice(0, 30).reduce((a, e) => a + e.mood, 0) / Math.min(entries.length, 30)
    : 0

  const streak = (() => {
    const today  = new Date()
    let count    = 0
    const dateSet = new Set(entries.map(e => e.date))
    for (let i = 0; i < 60; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const s = d.toISOString().split('T')[0]
      if (!dateSet.has(s)) break
      count++
    }
    return count
  })()

  const todayDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  if (status === 'loading' || loading) return (
    <div className="min-h-screen flex items-center justify-center pt-[72px]">
      <div className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}</div>
    </div>
  )

  if (!session) return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory pt-[72px] flex items-center justify-center px-[5%]">
      <div className="text-center max-w-[380px]">
        <p className="text-[3rem] mb-4">📊</p>
        <h1 className="font-display text-[1.6rem] font-bold text-charcoal mb-3">Mood Tracker</h1>
        <p className="text-text-mid text-[0.9rem] leading-[1.7] mb-6">
          Check in daily, spot your patterns, and understand what shifts your mood.
        </p>
        <Link href="/login"
          className="block bg-teal-deep text-white py-3.5 rounded-full font-semibold text-[0.95rem] no-underline hover:bg-teal-dark transition-colors text-center">
          Sign in to start →
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory pt-[72px]">

      {/* Header */}
      <div className="bg-gradient-to-br from-teal-deep to-teal-dark px-[5%] py-10 text-white">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-soft text-[0.72rem] font-semibold tracking-[0.2em] uppercase mb-1">{todayDate}</p>
          <h1 className="font-display text-[1.8rem] font-bold">Mood Tracker</h1>
          <p className="text-white/60 text-[0.88rem] mt-1">A daily check-in keeps self-awareness strong.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-[5%]">

        {/* Stats row */}
        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-[20px] border border-teal-light p-5 text-center">
              <MoodAvatar avg={avg} />
            </div>
            <div className="bg-white rounded-[20px] border border-teal-light p-5 text-center">
              <p className="text-[2.5rem] font-bold text-teal-deep">{streak}</p>
              <p className="text-text-xlight text-[0.75rem]">day streak</p>
            </div>
            <div className="bg-white rounded-[20px] border border-teal-light p-5 text-center">
              <p className="text-[2.5rem] font-bold text-teal-deep">{entries.length}</p>
              <p className="text-text-xlight text-[0.75rem]">total logs</p>
            </div>
          </div>
        )}

        {/* 30-day chart */}
        {entries.length > 2 && (
          <div className="bg-white rounded-[24px] border border-teal-light p-6 mb-6">
            <h2 className="font-display text-[1rem] font-semibold text-charcoal mb-4">📊 Last 30 Days</h2>
            <MoodBar entries={entries} />
            <div className="flex gap-4 mt-4 flex-wrap">
              {MOODS.map(m => (
                <span key={m.value} className="flex items-center gap-1 text-[0.72rem] text-text-xlight">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: m.color }} />{m.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Today's check-in card */}
        <div className="bg-white rounded-[24px] border border-teal-light p-7 mb-6">
          <h2 className="font-display text-[1.1rem] font-semibold text-charcoal mb-1">
            {todayMood ? 'Update today\'s mood' : 'How are you feeling today?'}
          </h2>
          <p className="text-text-xlight text-[0.82rem] mb-6">
            {todayMood
              ? `You logged ${MOODS[todayMood.mood - 1].label} earlier — feel free to update it.`
              : 'Take a moment to check in. No judgement here.'}
          </p>

          {/* Mood selector */}
          <div role="group" aria-label="Select your mood" className="flex gap-3 justify-center mb-6 flex-wrap">
            {MOODS.map(m => (
              <button key={m.value}
                onClick={() => setSelected(m.value)}
                aria-pressed={selected === m.value}
                aria-label={m.label}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-[16px] border-2 transition-all min-w-[60px] ${
                  selected === m.value
                    ? `${m.bg} ${m.border} scale-110`
                    : 'border-transparent hover:bg-teal-ghost'
                }`}>
                <span className="text-[2rem]">{m.emoji}</span>
                <span className="text-[0.68rem] font-semibold text-text-mid">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Note */}
          <div className="mb-5">
            <label htmlFor="mood-note" className="block text-[0.78rem] font-semibold text-text-mid mb-1.5">
              Add a note <span className="font-normal text-text-xlight">(optional)</span>
            </label>
            <textarea
              id="mood-note"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="What's on your mind today? What contributed to this feeling?"
              rows={3}
              className="w-full border border-teal-light rounded-[14px] px-4 py-3 text-[0.88rem] outline-none focus:border-teal-mid transition-colors resize-none bg-teal-ghost/30"
              maxLength={300}
            />
          </div>

          {savedToday && (
            <>
              <div className="bg-teal-ghost border border-teal-mid/30 rounded-[12px] px-4 py-3 mb-3 text-center">
                <p className="text-teal-deep text-[0.85rem] font-semibold">
                  {MOODS[(selected ?? 3) - 1].emoji} Mood logged — great job checking in! 🌿
                </p>
              </div>
              <MoodActivitySuggestion mood={selected} />
            </>
          )}

          <button onClick={saveMood} disabled={!selected || saving}
            className="w-full bg-teal-deep text-white py-3.5 rounded-full font-semibold text-[0.95rem] hover:bg-teal-dark disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : todayMood ? 'Update mood' : 'Log my mood'}
          </button>
        </div>

        {/* Recent entries */}
        {entries.length > 0 && (
          <div className="bg-white rounded-[24px] border border-teal-light p-6">
            <h2 className="font-display text-[1rem] font-semibold text-charcoal mb-4">Recent check-ins</h2>
            <div className="space-y-3">
              {entries.slice(0, 10).map(e => {
                const m = MOODS[e.mood - 1]
                const d = new Date(e.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
                return (
                  <div key={e.id} className={`flex items-center gap-3 p-3 rounded-[14px] border ${m.border} ${m.bg}`}>
                    <span className="text-[1.5rem]">{m.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[0.85rem] text-charcoal">{m.label}</span>
                        <span className="text-[0.72rem] text-text-xlight">{d}</span>
                      </div>
                      {e.note && <p className="text-[0.8rem] text-text-mid mt-0.5 truncate">{e.note}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
