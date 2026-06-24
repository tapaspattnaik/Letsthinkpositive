'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Habit {
  id:        number
  name:      string
  emoji:     string
  doneToday: boolean
  createdAt: string
}

const EMOJI_OPTIONS = ['✅','🏃','📖','🧘','💧','🥗','😴','📝','🌿','🎯','💪','🧠','🎨','☀️','🙏']

function StreakDots({ dates }: { dates: string[] }) {
  const today  = new Date()
  const days   = Array.from({ length: 21 }, (_, i) => {
    const d   = new Date(today)
    d.setDate(d.getDate() - (20 - i))
    return d.toISOString().split('T')[0]
  })
  return (
    <div className="flex gap-1 flex-wrap">
      {days.map(d => (
        <div key={d}
          className={`w-3 h-3 rounded-sm transition-all ${dates.includes(d) ? 'bg-teal-mid' : 'bg-teal-light/50'}`}
          title={d}
        />
      ))}
    </div>
  )
}

export default function HabitsPage() {
  const { data: session, status } = useSession()

  const [habits,     setHabits]     = useState<Habit[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [name,       setName]       = useState('')
  const [emoji,      setEmoji]      = useState('✅')
  const [submitting, setSubmitting] = useState(false)
  const [toggling,   setToggling]   = useState<number | null>(null)
  const [history,    setHistory]    = useState<Record<number, string[]>>({})
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res  = await fetch('/api/habits')
      const data = await res.json()
      if (Array.isArray(data)) setHabits(data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => {
    if (status === 'authenticated') load()
    else if (status === 'unauthenticated') setLoading(false)
  }, [status])

  // Fetch history for each habit
  useEffect(() => {
    habits.forEach(async h => {
      const res  = await fetch(`/api/habits/${h.id}/log`)
      const data = await res.json()
      if (Array.isArray(data)) setHistory(prev => ({ ...prev, [h.id]: data }))
    })
  }, [habits])

  async function toggleHabit(id: number) {
    if (!session) return
    setToggling(id)
    const res  = await fetch(`/api/habits/${id}/log`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      setHabits(prev => prev.map(h => h.id === id ? { ...h, doneToday: data.done } : h))
      // Update local history
      const today = new Date().toISOString().split('T')[0]
      setHistory(prev => {
        const curr = prev[id] ?? []
        return {
          ...prev,
          [id]: data.done ? [...curr, today] : curr.filter(d => d !== today),
        }
      })
    }
    setToggling(null)
  }

  async function addHabit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    const res  = await fetch('/api/habits', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, emoji }),
    })
    const data = await res.json()
    if (res.ok) {
      setHabits(prev => [...prev, data])
      setName(''); setEmoji('✅'); setShowForm(false)
    }
    setSubmitting(false)
  }

  async function deleteHabit(id: number) {
    await fetch(`/api/habits/${id}`, { method: 'DELETE' })
    setHabits(prev => prev.filter(h => h.id !== id))
    setConfirmDelete(null)
  }

  const [struggling, setStruggling] = useState<{ id: number; name: string; emoji: string; logged: number; lite: string }[]>([])

  useEffect(() => {
    if (status === 'authenticated' && habits.length > 0) {
      fetch('/api/insights/struggling-habits')
        .then(r => r.ok ? r.json() : [])
        .then(d => setStruggling(Array.isArray(d) ? d : []))
        .catch(() => {})
    }
  }, [habits, status])

  const doneCount  = habits.filter(h => h.doneToday).length
  const totalCount = habits.length
  const pct        = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0
  const today      = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  if (status === 'loading' || loading) return (
    <div className="min-h-screen flex items-center justify-center pt-[72px]">
      <div className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}</div>
    </div>
  )

  if (!session) return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory pt-[72px] flex items-center justify-center px-[5%]">
      <div className="text-center max-w-[380px]">
        <p className="text-[3rem] mb-4">🎯</p>
        <h1 className="font-display text-[1.6rem] font-bold text-charcoal mb-3">Habit Tracker</h1>
        <p className="text-text-mid text-[0.9rem] leading-[1.7] mb-6">
          Build small daily habits that compound into big change. Sign in to start tracking.
        </p>
        <Link href="/login"
          className="block bg-teal-deep text-white py-3.5 rounded-full font-semibold text-[0.95rem] no-underline hover:bg-teal-dark transition-colors text-center">
          Sign in to start →
        </Link>
        <Link href="/register" className="block text-teal-mid text-[0.83rem] mt-3 no-underline hover:text-teal-deep">
          Create free account
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory pt-[72px]">

      {/* Hero bar */}
      <div className="bg-gradient-to-br from-teal-deep to-teal-dark px-[5%] py-10 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
            <div>
              <p className="text-amber-soft text-[0.72rem] font-semibold tracking-[0.2em] uppercase mb-1">{today}</p>
              <h1 className="font-display text-[1.8rem] font-bold">Daily Habits</h1>
            </div>
            {totalCount > 0 && (
              <div className="text-right">
                <p className="text-[2rem] font-bold text-amber">{doneCount}/{totalCount}</p>
                <p className="text-white/60 text-[0.78rem]">completed today</p>
              </div>
            )}
          </div>

          {totalCount > 0 && (
            <div>
              <div className="flex justify-between text-[0.72rem] text-white/60 mb-1">
                <span>Today&apos;s progress</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                <div className="h-full bg-amber rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-[5%]">

        {/* Struggling habit nudges */}
        {struggling.length > 0 && (
          <div className="mb-6 space-y-2">
            {struggling.map(h => (
              <div key={h.id} className="bg-amber-pale border border-amber/30 rounded-[16px] px-4 py-3 flex items-start gap-3">
                <span className="text-[1.4rem] flex-shrink-0">{h.emoji}</span>
                <div className="min-w-0">
                  <p className="text-[0.8rem] font-bold text-charcoal">{h.name} — let&apos;s make it easier</p>
                  <p className="text-[0.75rem] text-text-mid mt-0.5 leading-snug">
                    You&apos;ve only checked in {h.logged}× this week. Try instead: <span className="font-semibold text-teal-deep">{h.lite}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Habits list */}
        {habits.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-[24px] border border-teal-light mb-6">
            <p className="text-[3rem] mb-3">🌱</p>
            <h2 className="font-display text-[1.2rem] text-charcoal font-semibold mb-2">No habits yet</h2>
            <p className="text-text-mid text-[0.88rem] mb-5">Start with one small daily habit — consistency is everything.</p>
            <button onClick={() => setShowForm(true)}
              className="bg-teal-deep text-white px-6 py-3 rounded-full font-semibold text-[0.9rem] hover:bg-teal-dark transition-colors">
              Add your first habit
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {habits.map(habit => (
              <div key={habit.id}
                className={`bg-white rounded-[20px] border px-5 py-4 transition-all ${
                  habit.doneToday ? 'border-teal-mid/50 bg-teal-ghost/20' : 'border-teal-light'
                }`}>
                <div className="flex items-center gap-4">
                  {/* Check button */}
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    disabled={toggling === habit.id}
                    aria-pressed={habit.doneToday}
                    aria-label={`${habit.doneToday ? 'Unmark' : 'Mark'} ${habit.name} as done today`}
                    className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-[1.2rem] border-2 transition-all ${
                      habit.doneToday
                        ? 'bg-teal-deep border-teal-deep text-white scale-110'
                        : 'border-teal-light hover:border-teal-mid hover:bg-teal-ghost'
                    }`}>
                    {toggling === habit.id ? '…' : habit.doneToday ? '✓' : habit.emoji}
                  </button>

                  {/* Name + streak dots */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-[0.95rem] transition-all ${habit.doneToday ? 'text-teal-deep line-through opacity-60' : 'text-charcoal'}`}>
                      {habit.emoji} {habit.name}
                    </p>
                    {history[habit.id] && (
                      <div className="mt-1.5">
                        <StreakDots dates={history[habit.id]} />
                      </div>
                    )}
                    {history[habit.id] && (
                      <p className="text-[0.7rem] text-text-xlight mt-1">
                        {history[habit.id].length} day{history[habit.id].length !== 1 ? 's' : ''} logged (last 3 weeks)
                      </p>
                    )}
                  </div>

                  {/* Delete with inline confirmation */}
                  {confirmDelete === habit.id ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="text-[0.72rem] font-semibold text-red-500 hover:text-red-700 transition-colors px-2 py-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label={`Confirm remove habit: ${habit.name}`}>
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-[0.72rem] text-text-mid hover:text-charcoal transition-colors px-2 py-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Cancel delete">
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(habit.id)}
                      className="text-text-xlight hover:text-red-400 transition-colors flex-shrink-0 ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label={`Remove habit: ${habit.name}`}>
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add habit form */}
        {showForm ? (
          <div className="bg-white rounded-[24px] border border-teal-light p-6 mb-6">
            <h3 className="font-display text-[1.1rem] font-semibold text-charcoal mb-4">New Habit</h3>
            <form onSubmit={addHabit} className="space-y-4">
              <div>
                <label htmlFor="habit-name" className="block text-[0.78rem] font-semibold text-text-mid mb-1.5">Habit name *</label>
                <input
                  id="habit-name"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Morning meditation"
                  className="w-full px-4 py-3 border border-teal-light rounded-[14px] text-[0.9rem] outline-none focus:border-teal-mid transition-colors bg-teal-ghost"
                />
              </div>
              <div>
                <p id="emoji-label" className="block text-[0.78rem] font-semibold text-text-mid mb-1.5">Pick an emoji</p>
                <div role="group" aria-labelledby="emoji-label" className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(e => (
                    <button key={e} type="button"
                      onClick={() => setEmoji(e)}
                      aria-pressed={emoji === e}
                      aria-label={e}
                      className={`text-[1.3rem] p-2 rounded-[10px] transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${emoji === e ? 'bg-teal-deep scale-115' : 'hover:bg-teal-ghost'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting}
                  className="bg-teal-deep text-white px-6 py-3 rounded-full font-semibold text-[0.9rem] hover:bg-teal-dark disabled:opacity-60 transition-colors">
                  {submitting ? 'Adding…' : 'Add habit'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setName(''); setEmoji('✅') }}
                  className="border border-teal-light text-text-mid px-6 py-3 rounded-full text-[0.9rem] hover:bg-teal-ghost transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)}
            className="w-full border-2 border-dashed border-teal-light rounded-[20px] py-4 text-text-mid text-[0.88rem] hover:border-teal-mid hover:text-teal-deep transition-colors flex items-center justify-center gap-2">
            <span className="text-[1.2rem]">+</span> Add a new habit
          </button>
        )}

        {/* Tips */}
        <div className="mt-8 bg-amber/8 border border-amber/25 rounded-[20px] p-5">
          <p className="text-[0.72rem] font-bold text-amber uppercase tracking-wider mb-2">💡 Habit tip</p>
          <p className="text-text-mid text-[0.85rem] leading-[1.7]">
            Start with just 1–3 habits. The goal isn&apos;t perfection — it&apos;s consistency.
            Missing one day is fine. Missing two in a row is the real danger.
          </p>
        </div>
      </div>
    </div>
  )
}
