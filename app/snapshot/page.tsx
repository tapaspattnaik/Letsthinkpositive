'use client'

// npm install html2canvas
import html2canvas from 'html2canvas'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

interface MoodEntry {
  date: string
  mood: number | null
}

interface SnapshotData {
  week: string
  mood: {
    entries:  MoodEntry[]
    average:  number | null
    trend:    'up' | 'down' | 'stable' | 'insufficient'
    bestDay:  string | null
    bestMood: number | null
  }
  habits: {
    total:          number
    completedToday: number
    weeklyRate:     number
    topHabit:       string | null
  }
  streak: {
    current: number
    longest: number
  }
  message: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOOD_COLORS: Record<number, string> = {
  1: '#FFB3B3',
  2: '#FFCC99',
  3: '#FFE999',
  4: '#B3FFB3',
  5: '#A8D8D0',
}

const MOOD_EMOJIS: Record<number, string> = {
  1: '😔',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

const DAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function moodEmoji(avg: number | null): string {
  if (avg === null) return '—'
  const idx = Math.round(avg)
  return MOOD_EMOJIS[Math.max(1, Math.min(5, idx))] ?? '😐'
}

function trendLabel(trend: SnapshotData['mood']['trend']) {
  switch (trend) {
    case 'up':           return { icon: '↑', text: 'Improving',        color: '#2D9B8A' }
    case 'down':         return { icon: '↓', text: 'Dipping',          color: '#E8A020' }
    case 'stable':       return { icon: '→', text: 'Steady',           color: '#1A6B6B' }
    case 'insufficient': return { icon: '·', text: 'Not enough data',  color: '#6B8F8F' }
  }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-teal-light/40 rounded-[12px] ${className ?? ''}`} />
  )
}

function SnapshotSkeleton() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-[5%] space-y-6">
      <Skeleton className="h-24 rounded-[24px]" />
      <Skeleton className="h-64 rounded-[24px]" />
      <Skeleton className="h-48 rounded-[24px]" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-28 rounded-[24px]" />
        <Skeleton className="h-28 rounded-[24px]" />
      </div>
    </div>
  )
}

// ── Mood Circle ───────────────────────────────────────────────────────────────

function MoodCircle({ mood, dayInitial }: { mood: number | null; dayInitial: string }) {
  const filled  = mood !== null
  const bg      = filled ? MOOD_COLORS[mood!] : 'transparent'
  const border  = filled ? '2px solid transparent' : '2px dashed #A8D8D0'

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-[1.1rem] transition-all"
        style={{ background: bg, border }}
        title={filled ? `Mood: ${mood}` : 'No entry'}
      >
        {filled ? MOOD_EMOJIS[mood!] : ''}
      </div>
      <span className="text-[0.65rem] font-semibold text-[#6B8F8F]">{dayInitial}</span>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SnapshotPage() {
  const { data: session, status } = useSession()
  const [data,       setData]       = useState<SnapshotData | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [downloading, setDownloading] = useState(false)
  const snapshotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/snapshot')
        .then(r => r.json())
        .then(d => { setData(d); setLoading(false) })
        .catch(() => setLoading(false))
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  // ── Sign-in prompt ──────────────────────────────────────────────────────────
  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory pt-[72px]">
        <div className="bg-gradient-to-br from-teal-deep to-teal-dark px-[5%] py-10 text-white">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-4 w-32 mb-2 bg-white/20" />
            <Skeleton className="h-8 w-72 bg-white/20" />
          </div>
        </div>
        <SnapshotSkeleton />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory pt-[72px] flex items-center justify-center px-[5%]">
        <div className="text-center max-w-[400px]">
          <p className="text-[3.5rem] mb-4">🌿</p>
          <h1 className="font-display text-[1.8rem] font-bold text-charcoal mb-3">
            Your Wellness Snapshot
          </h1>
          <p className="text-[#4A6363] text-[0.95rem] leading-[1.75] mb-7">
            Your personal weekly report is waiting — mood trends, habit momentum,
            streaks, and an encouraging note just for you.
          </p>
          <Link
            href="/login"
            className="block bg-teal-deep text-white py-3.5 rounded-full font-semibold text-[0.95rem] no-underline hover:bg-teal-dark transition-colors text-center"
          >
            Sign in to see your snapshot →
          </Link>
          <Link href="/register" className="block text-teal-mid text-[0.83rem] mt-3 no-underline hover:text-teal-deep">
            Create a free account
          </Link>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory pt-[72px] flex items-center justify-center">
        <p className="text-[#4A6363] text-[0.9rem]">Could not load your snapshot right now.</p>
      </div>
    )
  }

  // ── Download handler ────────────────────────────────────────────────────────
  async function downloadSnapshot() {
    if (!snapshotRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(snapshotRef.current, {
        backgroundColor: '#EEF7F6',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const link      = document.createElement('a')
      link.download   = `wellness-snapshot-${data!.week.replace(/\s/g, '-')}.png`
      link.href       = canvas.toDataURL('image/png')
      link.click()
    } catch { /* silent */ }
    setDownloading(false)
  }

  const { mood, habits, streak, message, week } = data
  const trend = trendLabel(mood.trend)

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory pt-[72px]">

      {/* ── Page header (outside downloadable area) ─────────────────────── */}
      <div className="bg-gradient-to-br from-teal-deep to-teal-dark px-[5%] py-10 text-white">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-soft text-[0.72rem] font-semibold tracking-[0.2em] uppercase mb-1">
            Weekly Report
          </p>
          <h1 className="font-display text-[1.8rem] font-bold">My Wellness Snapshot</h1>
          <p className="text-white/60 text-[0.88rem] mt-1">{week}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-[5%]">

        {/* ── Downloadable snapshot ─────────────────────────────────────── */}
        <div
          id="wellness-snapshot"
          ref={snapshotRef}
          className="space-y-5 bg-[#EEF7F6] rounded-[28px] p-1"
        >

          {/* Encouraging message */}
          <div className="bg-white rounded-[24px] border border-teal-light px-7 py-6">
            <p className="text-[0.7rem] font-bold text-teal-mid uppercase tracking-[0.18em] mb-2">
              This week
            </p>
            <p className="font-display text-[1.15rem] italic text-[#1A6B6B] leading-[1.75]">
              &ldquo;{message}&rdquo;
            </p>
          </div>

          {/* ── Mood section ──────────────────────────────────────────────── */}
          <div className="bg-teal-ghost rounded-[24px] border border-teal-light p-6">
            <h2 className="font-display text-[1.1rem] font-semibold text-charcoal mb-5">
              This Week&apos;s Mood
            </h2>

            {/* 7 circles */}
            <div className="flex justify-between mb-6">
              {mood.entries.map((entry, i) => (
                <MoodCircle
                  key={entry.date}
                  mood={entry.mood}
                  dayInitial={DAY_INITIALS[i]}
                />
              ))}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 flex-wrap">
              {mood.average !== null ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[1.6rem] text-[#1A6B6B]">{mood.average}</span>
                  <span className="text-[1.6rem]">{moodEmoji(mood.average)}</span>
                  <span className="text-[0.78rem] text-[#4A6363]">avg mood</span>
                </div>
              ) : (
                <p className="text-[0.85rem] text-[#6B8F8F] italic">No mood check-ins yet this week.</p>
              )}

              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.78rem] font-semibold"
                style={{ background: trend.color + '18', color: trend.color }}
              >
                <span className="text-[1rem]">{trend.icon}</span>
                <span>{trend.text}</span>
              </div>
            </div>

            {mood.bestDay && (
              <p className="text-[0.78rem] text-[#4A6363] mt-3">
                Best day: <strong className="text-[#1A6B6B]">{mood.bestDay}</strong>
                {mood.bestMood && <span className="ml-1">({MOOD_EMOJIS[mood.bestMood]} mood {mood.bestMood})</span>}
              </p>
            )}
          </div>

          {/* ── Habits section ────────────────────────────────────────────── */}
          <div
            className="rounded-[24px] border p-6"
            style={{ background: '#FFF8EC', borderColor: '#F5C96A66' }}
          >
            <h2 className="font-display text-[1.1rem] font-semibold text-charcoal mb-4">
              Habit Momentum
            </h2>

            {habits.total === 0 ? (
              <p className="text-[0.88rem] text-[#7A6030] italic">
                No active habits yet.{' '}
                <Link href="/habits" className="text-[#E8A020] underline hover:text-[#C4871A]">
                  Add some habits
                </Link>{' '}
                to track your momentum here.
              </p>
            ) : (
              <>
                {/* Big percentage */}
                <div className="flex items-end gap-2 mb-3">
                  <span className="font-display text-[2.8rem] font-bold text-[#E8A020] leading-none">
                    {habits.weeklyRate}%
                  </span>
                  <span className="text-[0.82rem] text-[#7A6030] mb-1.5">
                    completion rate this week
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 bg-[#F5C96A]/30 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width:      `${habits.weeklyRate}%`,
                      background: 'linear-gradient(90deg, #E8A020, #F5C96A)',
                    }}
                  />
                </div>

                {/* Sub-stats */}
                <div className="flex flex-col gap-1.5">
                  {habits.topHabit && (
                    <p className="text-[0.82rem] text-[#7A6030]">
                      Top habit:{' '}
                      <strong className="text-[#C4871A]">{habits.topHabit}</strong>
                    </p>
                  )}
                  <p className="text-[0.82rem] text-[#7A6030]">
                    <strong>{habits.completedToday}</strong> of <strong>{habits.total}</strong>{' '}
                    habit{habits.total !== 1 ? 's' : ''} done today &middot;{' '}
                    <strong>{habits.total}</strong> active habit{habits.total !== 1 ? 's' : ''}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ── Streak cards ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-[24px] border border-teal-light p-5 text-center">
              <p className="text-[1.8rem] mb-1">🔥</p>
              <p className="font-bold text-[2rem] text-[#1A6B6B] leading-none">{streak.current}</p>
              <p className="text-[0.72rem] text-[#4A6363] mt-1 font-semibold uppercase tracking-wider">
                Day streak
              </p>
            </div>
            <div className="bg-white rounded-[24px] border border-teal-light p-5 text-center">
              <p className="text-[1.8rem] mb-1">🏆</p>
              <p className="font-bold text-[2rem] text-[#1A6B6B] leading-none">{streak.longest}</p>
              <p className="text-[0.72rem] text-[#4A6363] mt-1 font-semibold uppercase tracking-wider">
                Longest streak
              </p>
            </div>
          </div>

        </div>
        {/* end #wellness-snapshot */}

        {/* ── Download button (outside snapshot) ──────────────────────────── */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={downloadSnapshot}
            disabled={downloading}
            className="flex items-center gap-2 bg-teal-deep text-white px-7 py-3.5 rounded-full font-semibold text-[0.95rem] hover:bg-teal-dark disabled:opacity-60 transition-colors shadow-sm"
          >
            {downloading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Preparing…
              </>
            ) : (
              <>
                <span>⬇️</span>
                Download my snapshot
              </>
            )}
          </button>
        </div>

        {/* ── Quick links ──────────────────────────────────────────────────── */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href="/mood"
            className="text-[0.82rem] font-semibold text-[#1A6B6B] border border-teal-light rounded-full px-4 py-2 hover:bg-teal-ghost transition-colors no-underline"
          >
            📊 Log today&apos;s mood
          </Link>
          <Link
            href="/habits"
            className="text-[0.82rem] font-semibold text-[#1A6B6B] border border-teal-light rounded-full px-4 py-2 hover:bg-teal-ghost transition-colors no-underline"
          >
            🎯 Check habits
          </Link>
          <Link
            href="/journal"
            className="text-[0.82rem] font-semibold text-[#1A6B6B] border border-teal-light rounded-full px-4 py-2 hover:bg-teal-ghost transition-colors no-underline"
          >
            📝 Journal
          </Link>
        </div>

      </div>
    </div>
  )
}
