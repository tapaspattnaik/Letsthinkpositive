'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LtpLogo } from '@/components/ui/LtpLogo'

const QUESTIONS = [
  {
    id: 'stress',
    q: 'How stressed do you feel right now?',
    emoji: '😰',
    options: [
      { label: 'Very stressed — overwhelmed',    value: 5, icon: '😩' },
      { label: 'Quite stressed — hard to cope',  value: 4, icon: '😟' },
      { label: 'Moderate — manageable',          value: 3, icon: '😐' },
      { label: 'Mild — mostly okay',             value: 2, icon: '🙂' },
      { label: 'Calm — stress is low',           value: 1, icon: '😊' },
    ],
  },
  {
    id: 'sleep',
    q: 'How has your sleep been lately?',
    emoji: '🌙',
    options: [
      { label: 'Terrible — barely sleeping',     value: 5, icon: '😩' },
      { label: 'Poor — often disturbed',         value: 4, icon: '😕' },
      { label: 'Okay — could be better',         value: 3, icon: '😐' },
      { label: 'Good — mostly restful',          value: 2, icon: '😊' },
      { label: 'Excellent — wake refreshed',     value: 1, icon: '😴' },
    ],
  },
  {
    id: 'mood',
    q: 'How would you describe your general mood?',
    emoji: '💛',
    options: [
      { label: 'Very low — persistent sadness',  value: 5, icon: '😢' },
      { label: 'Low — often flat or anxious',    value: 4, icon: '😞' },
      { label: 'Mixed — up and down',            value: 3, icon: '😐' },
      { label: 'Good — mostly positive',         value: 2, icon: '🙂' },
      { label: 'Great — happy and energised',    value: 1, icon: '😄' },
    ],
  },
  {
    id: 'goal',
    q: 'What is your main wellness goal?',
    emoji: '🎯',
    options: [
      { label: 'Reduce stress & anxiety',        value: 'stress',   icon: '🧘' },
      { label: 'Sleep better',                   value: 'sleep',    icon: '🌙' },
      { label: 'Improve mood & happiness',       value: 'mood',     icon: '😊' },
      { label: 'Build healthy habits',           value: 'habits',   icon: '🎯' },
      { label: 'Be more mindful & present',      value: 'mindful',  icon: '🌿' },
    ],
  },
  {
    id: 'time',
    q: 'How much time can you give to wellness daily?',
    emoji: '⏱️',
    options: [
      { label: '5 minutes — just need quick wins', value: 5,  icon: '⚡' },
      { label: '10 minutes — short but consistent',value: 10, icon: '🕐' },
      { label: '20 minutes — building a routine',  value: 20, icon: '📅' },
      { label: '30+ minutes — committed',          value: 30, icon: '💪' },
    ],
  },
  {
    id: 'approach',
    q: 'What kind of support resonates most with you?',
    emoji: '💙',
    options: [
      { label: 'Guided exercises (breathing, yoga)', value: 'guided',   icon: '🧘' },
      { label: 'Journaling & self-reflection',       value: 'journal',  icon: '📓' },
      { label: 'Community & connection',             value: 'community',icon: '💛' },
      { label: 'AI coaching & conversation',         value: 'ai',       icon: '🤖' },
      { label: 'Tracking & data',                    value: 'track',    icon: '📊' },
    ],
  },
]

type Answer = { questionId: string; value: number | string }

interface Recommendation {
  icon: string; title: string; desc: string; href: string; priority: 'primary' | 'secondary'
}

function getRecommendations(answers: Answer[]): Recommendation[] {
  const stress = Number(answers.find(a => a.questionId === 'stress')?.value ?? 3)
  const sleep  = Number(answers.find(a => a.questionId === 'sleep')?.value  ?? 3)
  const mood   = Number(answers.find(a => a.questionId === 'mood')?.value   ?? 3)
  const goal   = String(answers.find(a => a.questionId === 'goal')?.value   ?? 'mindful')
  const approach = String(answers.find(a => a.questionId === 'approach')?.value ?? 'guided')

  const recs: Recommendation[] = []

  // High stress → breathing + coach
  if (stress >= 4) {
    recs.push({ icon: '🌬️', title: 'Voice-Guided Breathing', desc: 'Start with 4-7-8 breathing to calm your nervous system in under 3 minutes.', href: '/breathing', priority: 'primary' })
    recs.push({ icon: '🌿', title: 'Calm Coach', desc: 'Talk through what\'s stressing you with our AI wellness guide.', href: '/coach', priority: 'secondary' })
  }

  // Poor sleep → sleep tracker + breathing
  if (sleep >= 4) {
    recs.push({ icon: '🌙', title: 'Sleep Tracker', desc: 'Start logging your sleep tonight to spot patterns and improve rest.', href: '/sleep', priority: 'primary' })
    recs.push({ icon: '🧘', title: 'Guided Meditation', desc: 'A short body scan meditation before bed can transform your sleep quality.', href: '/meditation', priority: 'secondary' })
  }

  // Low mood → gratitude + challenges
  if (mood >= 4) {
    recs.push({ icon: '📓', title: 'Gratitude Journal', desc: 'Writing 3 things you\'re grateful for daily is clinically proven to lift mood.', href: '/journal', priority: 'primary' })
    recs.push({ icon: '😊', title: 'Foods for Happiness', desc: 'Discover how certain foods directly boost serotonin and dopamine.', href: '/happy-foods', priority: 'secondary' })
  }

  // Goal-based
  if (goal === 'habits') recs.push({ icon: '🎯', title: 'Habit Tracker', desc: 'Build one small habit at a time. Consistency beats intensity.', href: '/habits', priority: 'primary' })
  if (goal === 'mindful') recs.push({ icon: '🧘', title: 'Morning Intention', desc: 'Set a single word intention every morning to anchor your day.', href: '/intention', priority: 'primary' })
  if (goal === 'stress') recs.push({ icon: '📊', title: 'Mood Tracker', desc: 'Track what triggers your stress — patterns reveal solutions.', href: '/mood', priority: 'secondary' })

  // Approach-based
  if (approach === 'community') recs.push({ icon: '💛', title: 'Community', desc: 'Share, listen, and connect with people on the same path.', href: '/community', priority: 'secondary' })
  if (approach === 'track') recs.push({ icon: '📈', title: 'Wellness Snapshot', desc: 'See your 7-day wellbeing summary in one beautiful view.', href: '/snapshot', priority: 'secondary' })
  if (approach === 'ai') recs.push({ icon: '🌿', title: 'Calm Coach', desc: 'Your personal AI wellness companion — available 24/7.', href: '/coach', priority: 'primary' })

  // Always recommend challenges
  recs.push({ icon: '🏆', title: '30-Day Gratitude Challenge', desc: 'Join thousands who have transformed their outlook in 30 days.', href: '/challenges', priority: 'secondary' })

  // Deduplicate by href and limit
  const seen = new Set<string>()
  return recs.filter(r => { if (seen.has(r.href)) return false; seen.add(r.href); return true }).slice(0, 6)
}

function getWellnessScore(answers: Answer[]) {
  const stress = Number(answers.find(a => a.questionId === 'stress')?.value ?? 3)
  const sleep  = Number(answers.find(a => a.questionId === 'sleep')?.value  ?? 3)
  const mood   = Number(answers.find(a => a.questionId === 'mood')?.value   ?? 3)
  const avg = (stress + sleep + mood) / 3
  const score = Math.round(((5 - avg) / 4) * 100)
  if (score >= 75) return { score, label: 'Thriving',    color: 'text-teal-deep', bg: 'bg-teal-ghost', emoji: '🌟' }
  if (score >= 50) return { score, label: 'Progressing', color: 'text-amber',     bg: 'bg-amber/15',   emoji: '🌱' }
  if (score >= 25) return { score, label: 'Struggling',  color: 'text-orange-500',bg: 'bg-orange-50',  emoji: '🤗' }
  return { score, label: 'Need support', color: 'text-red-500', bg: 'bg-red-50', emoji: '💙' }
}

export default function WellnessQuizPage() {
  const [step,    setStep]    = useState<'intro' | number | 'results'>('intro')
  const [answers, setAnswers] = useState<Answer[]>([])

  const qIdx = typeof step === 'number' ? step : 0

  function answer(value: number | string) {
    const newAnswers = [...answers.filter(a => a.questionId !== QUESTIONS[qIdx].id), { questionId: QUESTIONS[qIdx].id, value }]
    setAnswers(newAnswers)
    if (qIdx < QUESTIONS.length - 1) setStep(qIdx + 1)
    else setStep('results')
  }

  function restart() { setAnswers([]); setStep('intro') }

  // Intro
  if (step === 'intro') return (
    <div className="min-h-screen bg-gradient-to-br from-teal-ghost to-ivory pt-[72px] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <Link href="/" className="inline-flex justify-center mb-6"><LtpLogo size={48} /></Link>
        <span className="inline-block bg-amber/20 text-amber text-[0.72rem] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">✨ Wellness Assessment</span>
        <h1 className="font-display text-[2.2rem] text-charcoal font-bold leading-snug mb-4">
          Discover your <em className="text-teal-deep italic">personal wellness plan.</em>
        </h1>
        <p className="text-text-mid text-[0.97rem] leading-[1.8] mb-6">
          6 quick questions. Honest answers. A personalised roadmap built just for you — in under 2 minutes.
        </p>
        <div className="flex justify-center gap-6 mb-8 text-[0.82rem] text-text-xlight">
          <span>⏱ 2 minutes</span>
          <span>🔒 Private</span>
          <span>🎯 Personalised</span>
        </div>
        <button onClick={() => setStep(0)}
          className="bg-teal-deep text-white px-10 py-4 rounded-full font-bold text-[1rem] hover:bg-teal-dark hover:-translate-y-0.5 transition-all shadow-lift">
          Begin my assessment →
        </button>
        <p className="text-text-xlight text-[0.75rem] mt-4">No sign-in required · No data stored</p>
      </div>
    </div>
  )

  // Results
  if (step === 'results') {
    const recs  = getRecommendations(answers)
    const score = getWellnessScore(answers)
    const primary   = recs.filter(r => r.priority === 'primary').slice(0, 2)
    const secondary = recs.filter(r => r.priority === 'secondary').slice(0, 4)

    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory pt-[72px] pb-16">
        <div className="max-w-2xl mx-auto px-[5%] pt-12">
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex justify-center mb-5"><LtpLogo size={44} /></Link>
            <span className="text-[3rem] block mb-3">{score.emoji}</span>
            <h1 className="font-display text-[2rem] text-charcoal font-bold mb-3">Your Wellness Plan is Ready</h1>

            {/* Score card */}
            <div className={`inline-flex items-center gap-4 ${score.bg} border border-current/20 rounded-[20px] px-7 py-4 mb-5`}>
              <div>
                <p className="text-[0.72rem] font-bold text-text-xlight uppercase tracking-widest">Wellness Score</p>
                <p className={`font-display text-[2.5rem] font-bold ${score.color} leading-none`}>{score.score}</p>
                <p className={`text-[0.78rem] font-semibold ${score.color}`}>{score.label}</p>
              </div>
              <div className="w-16 h-16">
                <svg viewBox="0 0 36 36" className="rotate-[-90deg]">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-current/20" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3"
                    strokeDasharray={`${(score.score / 100) * 87.96} 87.96`}
                    className={score.color} strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Primary recommendations */}
          <h2 className="font-display text-[1.2rem] font-bold text-charcoal mb-3">🎯 Start Here</h2>
          <p className="text-text-mid text-[0.88rem] mb-4">Based on your answers, these will have the biggest immediate impact:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {primary.map(r => (
              <Link key={r.href} href={r.href}
                className="bg-teal-deep text-white rounded-[20px] p-6 no-underline hover:-translate-y-1 hover:shadow-lift transition-all group">
                <span className="text-[2rem] block mb-3">{r.icon}</span>
                <h3 className="font-bold text-[1rem] mb-2">{r.title}</h3>
                <p className="text-white/75 text-[0.82rem] leading-[1.65] mb-3">{r.desc}</p>
                <span className="text-amber text-[0.82rem] font-semibold group-hover:text-amber-soft transition-colors">Start now →</span>
              </Link>
            ))}
          </div>

          {/* Secondary recommendations */}
          <h2 className="font-display text-[1.2rem] font-bold text-charcoal mb-4">💛 Also Explore</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {secondary.map(r => (
              <Link key={r.href} href={r.href}
                className="flex items-start gap-4 bg-white border border-teal-light rounded-[16px] p-4 no-underline hover:border-teal-mid hover:-translate-y-0.5 hover:shadow-card transition-all group">
                <span className="text-[1.6rem] flex-shrink-0">{r.icon}</span>
                <div>
                  <p className="font-bold text-charcoal text-[0.88rem] mb-0.5 group-hover:text-teal-deep transition-colors">{r.title}</p>
                  <p className="text-text-xlight text-[0.75rem] leading-snug">{r.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="text-center bg-amber text-charcoal px-7 py-3 rounded-full font-bold text-[0.92rem] no-underline hover:bg-amber-soft transition-colors">
              Create free account to track progress →
            </Link>
            <button onClick={restart} className="border border-teal-light text-text-mid px-6 py-3 rounded-full font-semibold text-[0.88rem] hover:bg-teal-ghost transition-colors">
              Retake quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Question
  const q = QUESTIONS[qIdx]
  const progress = ((qIdx) / QUESTIONS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-ghost to-ivory pt-[72px] flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-[0.72rem] text-text-xlight mb-2">
            <span>Question {qIdx + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-teal-light/50 rounded-full overflow-hidden">
            <div className="h-full bg-teal-deep rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-[28px] p-8 shadow-lift border border-teal-light">
          <span className="text-[3rem] block mb-4 text-center">{q.emoji}</span>
          <h2 className="font-display text-[1.4rem] text-charcoal font-bold text-center mb-6">{q.q}</h2>

          <div className="space-y-3">
            {q.options.map(opt => (
              <button key={String(opt.value)} onClick={() => answer(opt.value)}
                className="w-full flex items-center gap-4 text-left px-5 py-3.5 rounded-[16px] border border-teal-light hover:border-teal-mid hover:bg-teal-ghost hover:-translate-y-0.5 transition-all group">
                <span className="text-[1.5rem] flex-shrink-0">{opt.icon}</span>
                <span className="text-charcoal text-[0.92rem] font-medium group-hover:text-teal-deep transition-colors">{opt.label}</span>
              </button>
            ))}
          </div>

          {qIdx > 0 && (
            <button onClick={() => setStep(qIdx - 1)} className="mt-5 text-[0.78rem] text-text-xlight hover:text-teal-mid transition-colors">
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
