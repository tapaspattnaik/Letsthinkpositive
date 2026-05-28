'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const CHALLENGES = [
  {
    id: 'gratitude-30', icon: '🍂', title: '30-Day Gratitude Challenge',
    description: 'Cultivate a daily habit of gratitude. Each day, identify and appreciate 3 things you\'re thankful for.',
    duration: '30 Days', totalDays: 30, category: 'Mindfulness & Positivity',
    outcome: 'Increased feelings of happiness and appreciation.',
    difficulty: 'Easy',
    color: 'from-amber/20 to-amber/5', borderColor: 'border-amber/40',
    badgeColor: 'bg-amber/15 text-amber',
    startAction: 'Start by listing 3 things you\'re grateful for this evening.',
    banner: 'Unlock a more positive outlook — one small step at a time!',
    popular: true,
    badge: { icon: '🌟', name: 'Gratitude Master', tier: 'Gold' },
  },
  {
    id: 'mindfulness-7', icon: '🧘', title: '7-Day Morning Mindfulness',
    description: 'Begin each morning with a 5-minute mindfulness practice. Simple, quiet, transformative.',
    duration: '7 Days', totalDays: 7, category: 'Mindfulness',
    outcome: 'Calmer mornings and improved focus throughout the day.',
    difficulty: 'Easy',
    color: 'from-teal-ghost to-white', borderColor: 'border-teal-light',
    badgeColor: 'bg-teal-ghost text-teal-deep',
    startAction: 'Practise 5 minutes of mindful breathing tomorrow morning.',
    banner: 'Seven mornings. Seven chances to begin again.',
    badge: { icon: '🧘', name: 'Morning Mind', tier: 'Bronze' },
  },
  {
    id: 'movement-7', icon: '👣', title: '7 Days of Gentle Movement',
    description: 'Reconnect with your body through gentle daily movement — a walk, a stretch, a dance in your room.',
    duration: '7 Days', totalDays: 7, category: 'Movement & Wellbeing',
    outcome: 'Improved mood, energy, and body awareness.',
    difficulty: 'Easy',
    color: 'from-teal-ghost to-white', borderColor: 'border-teal-light',
    badgeColor: 'bg-teal-ghost text-teal-deep',
    startAction: 'Take a 20-minute walk today. That\'s day one.',
    banner: 'Challenge of the Week — starting fresh every Monday.',
    weeklyChallenge: true,
    badge: { icon: '🏃', name: '7-Day Mover', tier: 'Bronze' },
  },
  {
    id: 'sleep-21', icon: '🌙', title: '21-Day Sleep Reset',
    description: 'Build a consistent, calming bedtime routine that tells your mind and body: it\'s safe to rest now.',
    duration: '21 Days', totalDays: 21, category: 'Sleep',
    outcome: 'Falling asleep faster and waking up genuinely refreshed.',
    difficulty: 'Moderate',
    color: 'from-[#1A2B4A]/10 to-white', borderColor: 'border-[#1A2B4A]/20',
    badgeColor: 'bg-[#1A2B4A]/10 text-[#1A2B4A]',
    startAction: 'Tonight, charge your phone outside the bedroom and read for 15 minutes before sleep.',
    banner: 'Three weeks to a new relationship with rest.',
    badge: { icon: '🌙', name: 'Deep Sleeper', tier: 'Silver' },
  },
  {
    id: 'affirmations-21', icon: '⭐', title: '21-Day Affirmation Practice',
    description: 'Plant seeds of self-belief through daily affirmations — honest, gentle self-talk that actually sticks.',
    duration: '21 Days', totalDays: 21, category: 'Positive Affirmations',
    outcome: 'A kinder inner voice and stronger self-belief.',
    difficulty: 'Easy',
    color: 'from-amber/15 to-white', borderColor: 'border-amber/30',
    badgeColor: 'bg-amber/15 text-amber',
    startAction: 'Choose 2 affirmations that genuinely resonate with you right now.',
    banner: 'The words you speak to yourself become the story you live.',
    badge: { icon: '✨', name: 'I Am Enough', tier: 'Silver' },
  },
  {
    id: 'journal-14', icon: '📓', title: '14-Day Gratitude Journaling',
    description: 'Write in the Gratitude Journal every day for two weeks. Daily prompts keep it fresh.',
    duration: '14 Days', totalDays: 14, category: 'Gratitude',
    outcome: 'A daily writing habit and measurably improved mood.',
    difficulty: 'Easy',
    color: 'from-teal-ghost to-white', borderColor: 'border-teal-light',
    badgeColor: 'bg-teal-ghost text-teal-deep',
    startAction: 'Open the Gratitude Journal and write today\'s entry right now.',
    banner: '14 days. 14 new moments of appreciation.',
    badge: { icon: '📓', name: 'Grateful Heart', tier: 'Bronze' },
  },
]

type Progress = Record<string, {
  enrolled: boolean
  completedDays: string[]
  completedAt: string | null
  startedAt: string
}>

export default function ChallengesPage() {
  const { data: session } = useSession()
  const [progress,  setProgress]  = useState<Progress>({})
  const [loading,   setLoading]   = useState<string | null>(null)
  const [toast,     setToast]     = useState<{ msg: string; badge?: { icon: string; name: string } } | null>(null)

  const today = new Date().toISOString().slice(0, 10)

  const fetchProgress = useCallback(async () => {
    if (!session) return
    const res = await fetch('/api/challenges/progress')
    if (res.ok) setProgress(await res.json())
  }, [session])

  useEffect(() => { fetchProgress() }, [fetchProgress])

  function showToast(msg: string, badge?: { icon: string; name: string }) {
    setToast({ msg, badge })
    setTimeout(() => setToast(null), 5000)
  }

  async function enroll(id: string) {
    if (!session) { showToast('Sign in to join a challenge.'); return }
    setLoading(id)
    const res = await fetch('/api/challenges/enroll', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: id }),
    })
    const data = await res.json()
    if (data.ok || data.already) {
      await fetchProgress()
      showToast(data.already ? 'You\'re already in this challenge!' : 'Challenge started! Check in daily. 💪')
    }
    setLoading(null)
  }

  async function checkin(id: string, totalDays: number) {
    setLoading(id + '-checkin')
    const res = await fetch('/api/challenges/checkin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: id, totalDays }),
    })
    const data = await res.json()
    await fetchProgress()
    if (data.alreadyCheckedIn) { showToast('Already checked in today — come back tomorrow! ☀️'); }
    else if (data.isComplete && data.awardedBadge) {
      showToast(`🎉 Challenge complete! You earned the ${data.awardedBadge.name} badge!`, data.awardedBadge)
    } else if (data.isComplete) {
      showToast('🎉 Challenge complete! Well done!')
    } else {
      showToast(`Day ${data.days.length} checked in! Keep going 🌟`)
    }
    setLoading(null)
  }

  const weekly   = CHALLENGES.find(c => c.weeklyChallenge)
  const featured = CHALLENGES.find(c => c.popular)
  const rest     = CHALLENGES.filter(c => !c.popular && !c.weeklyChallenge)

  return (
    <>
      {/* Toast — role="status" so screen readers announce it */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        {toast && (
          <div className="bg-charcoal text-white px-6 py-3.5 rounded-full shadow-lg flex items-center gap-3 text-[0.9rem] font-medium animate-fade-in">
            {toast.badge && <span className="text-[1.3rem]" aria-hidden="true">{toast.badge.icon}</span>}
            {toast.msg}
          </div>
        )}
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
            <span className="w-6 h-0.5 bg-amber rounded" /> Wellness Challenges
          </div>
          <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-bold leading-snug mb-4">
            Small steps. <em className="italic text-amber-soft">Real change.</em>
          </h1>
          <p className="text-white/72 text-[1.05rem] leading-[1.8] max-w-[560px] mb-6">
            Join a challenge, check in every day, and earn a badge when you complete it.
            {!session && <span className="text-amber-soft"> <Link href="/register" className="underline">Create a free account</Link> to track your progress.</span>}
          </p>
          {/* Active count */}
          {session && Object.keys(progress).length > 0 && (
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-5 py-2.5 rounded-full text-[0.85rem]">
              🏃 You&apos;re active in <strong>{Object.keys(progress).length}</strong> challenge{Object.keys(progress).length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto py-14 px-[5%]">

        {/* Weekly challenge */}
        {weekly && (
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="bg-amber text-charcoal text-[0.7rem] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full">🔄 Challenge of the Week</span>
            </div>
            <ChallengeCard c={weekly} progress={progress[weekly.id]} onEnroll={enroll} onCheckin={checkin} loading={loading} today={today} />
          </div>
        )}

        {/* Featured */}
        {featured && (
          <div className="mb-14">
            <h2 className="font-display text-[1.15rem] text-charcoal font-semibold mb-5">🏆 Most Popular</h2>
            <ChallengeCard c={featured} progress={progress[featured.id]} onEnroll={enroll} onCheckin={checkin} loading={loading} today={today} large />
          </div>
        )}

        {/* All */}
        <div>
          <h2 className="font-display text-[1.15rem] text-charcoal font-semibold mb-6">All Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map(c => (
              <ChallengeCard key={c.id} c={c} progress={progress[c.id]} onEnroll={enroll} onCheckin={checkin} loading={loading} today={today} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

type ChallengeType = typeof CHALLENGES[number]
type ProgressEntry = Progress[string] | undefined

function ChallengeCard({ c, progress, onEnroll, onCheckin, loading, today, large = false }: {
  c: ChallengeType
  progress: ProgressEntry
  onEnroll: (id: string) => void
  onCheckin: (id: string, totalDays: number) => void
  loading: string | null
  today: string
  large?: boolean
}) {
  const enrolled        = !!progress?.enrolled
  const completedDays   = progress?.completedDays ?? []
  const isComplete      = !!progress?.completedAt
  const checkedToday    = completedDays.includes(today)
  const pct             = Math.round((completedDays.length / c.totalDays) * 100)
  const isLoading       = loading === c.id || loading === c.id + '-checkin'

  return (
    <div className={`bg-gradient-to-br ${c.color} border ${c.borderColor} rounded-[24px] p-7 flex flex-col h-full ${large ? 'md:flex-row md:gap-8 md:items-start' : ''}`}>
      <div className={`${large ? 'flex-1' : ''} flex flex-col flex-1`}>
        <span className="text-[2.4rem] block mb-3">{c.icon}</span>
        <div className={`inline-block text-[0.68rem] font-bold tracking-[0.12em] uppercase px-3 py-1 rounded-full mb-3 ${c.badgeColor}`}>
          {c.duration} · {c.difficulty}
        </div>
        <h3 className="font-display text-[1.2rem] text-charcoal font-semibold mb-2">{c.title}</h3>
        <p className="text-text-mid text-[0.88rem] leading-[1.75] mb-3">{c.description}</p>
        <p className="text-[0.82rem] text-text-light mb-1"><strong className="text-charcoal">Goal:</strong> {c.outcome}</p>

        {/* Badge preview */}
        <div className="flex items-center gap-2 mt-2 mb-4">
          <span className="text-[1rem]">{c.badge.icon}</span>
          <span className="text-[0.76rem] text-text-xlight">Complete to earn: <strong className="text-charcoal">{c.badge.name}</strong> <span className="text-amber">({c.badge.tier})</span></span>
        </div>

        {/* Progress bar */}
        {enrolled && !isComplete && (
          <div className="mt-auto mb-4">
            <div className="flex justify-between text-[0.75rem] text-text-xlight mb-1.5">
              <span>{completedDays.length} / {c.totalDays} days</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
              <div className="h-full bg-teal-mid rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {isComplete && (
          <div className="mt-auto mb-4 flex items-center gap-2 bg-white/70 rounded-[12px] px-4 py-2.5">
            <span className="text-[1.4rem]">{c.badge.icon}</span>
            <div>
              <p className="text-[0.82rem] font-bold text-teal-deep leading-none mb-0.5">Challenge Complete! 🎉</p>
              <p className="text-[0.72rem] text-text-xlight">{c.badge.name} badge earned</p>
            </div>
          </div>
        )}
      </div>

      {/* Action button */}
      <div className={`${large ? 'flex-shrink-0 self-end md:self-center' : 'mt-auto'} pt-2`}>
        {isComplete ? (
          <Link href="/profile" className="block bg-teal-deep text-white px-6 py-2.5 rounded-full font-semibold text-[0.85rem] no-underline hover:bg-teal-dark transition-colors text-center">
            View Badge →
          </Link>
        ) : enrolled ? (
          <button
            onClick={() => onCheckin(c.id, c.totalDays)}
            disabled={checkedToday || isLoading}
            className={`w-full px-6 py-2.5 rounded-full font-semibold text-[0.85rem] transition-colors text-center
              ${checkedToday
                ? 'bg-teal-ghost text-teal-deep border border-teal-light cursor-default'
                : 'bg-teal-deep text-white hover:bg-teal-dark disabled:opacity-60'}`}>
            {isLoading ? '…' : checkedToday ? '✓ Checked in today' : `Check in — Day ${completedDays.length + 1}`}
          </button>
        ) : (
          <button
            onClick={() => onEnroll(c.id)}
            disabled={isLoading}
            className="w-full bg-teal-deep text-white px-6 py-2.5 rounded-full font-semibold text-[0.85rem] hover:bg-teal-dark disabled:opacity-60 transition-colors text-center">
            {isLoading ? '…' : 'Join this challenge →'}
          </button>
        )}
        {!enrolled && <p className="text-[0.72rem] text-text-xlight text-center mt-2">{c.banner}</p>}
      </div>
    </div>
  )
}
