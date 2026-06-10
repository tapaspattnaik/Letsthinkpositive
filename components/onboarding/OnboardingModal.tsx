'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// ── Step data ──────────────────────────────────────────────────────────────
const GOALS = [
  { key: 'anxiety',   emoji: '💙', label: 'Feel less anxious',    desc: 'Calm your mind and reduce worry' },
  { key: 'sleep',     emoji: '🌙', label: 'Sleep better',         desc: 'Build a restful bedtime routine' },
  { key: 'gratitude', emoji: '🙏', label: 'Practice gratitude',   desc: 'Cultivate daily thankfulness' },
  { key: 'movement',  emoji: '👣', label: 'Move more',            desc: 'Bring gentle energy into your day' },
  { key: 'wellbeing', emoji: '🌱', label: 'General wellbeing',    desc: 'Improve how I feel overall' },
]

const CHALLENGES = [
  { key: 'overthinking', emoji: '🌀', label: 'Overthinking'     },
  { key: 'motivation',   emoji: '⚡', label: 'Low motivation'   },
  { key: 'sleep',        emoji: '🌙', label: 'Poor sleep'       },
  { key: 'mornings',     emoji: '🌅', label: 'Difficult mornings' },
  { key: 'stress',       emoji: '😤', label: 'Daily stress'     },
  { key: 'connection',   emoji: '🤝', label: 'Feeling isolated' },
]

const TIMES = [
  { key: 'morning',   emoji: '🌅', label: 'Morning — fresh start' },
  { key: 'afternoon', emoji: '☀️',  label: 'Afternoon — reset'    },
  { key: 'evening',   emoji: '🌙', label: 'Evening — wind down'   },
]

// ── First step recommendation ──────────────────────────────────────────────
const FIRST_STEPS: Record<string, { action: string; href: string; emoji: string }> = {
  anxiety:    { action: 'Try 2 minutes of box breathing — it resets your nervous system in seconds.', href: '/breathing', emoji: '💨' },
  sleep:      { action: 'Log tonight\'s sleep quality — just one tap to begin your sleep journey.', href: '/sleep', emoji: '🌙' },
  gratitude:  { action: 'Write 3 things you\'re grateful for today in your journal.', href: '/journal', emoji: '📓' },
  movement:   { action: 'Take a 10-minute walk today and log it as your first mood check-in.', href: '/mood', emoji: '👣' },
  wellbeing:  { action: 'Start with a mood check-in — it only takes 10 seconds.', href: '/mood', emoji: '😊' },
}

// ── Main component ─────────────────────────────────────────────────────────
export function OnboardingModal() {
  const { status } = useSession()
  const [show,      setShow]      = useState(false)
  const [step,      setStep]      = useState(1) // 1, 2, 3
  const [goal,      setGoal]      = useState('')
  const [challenge, setChallenge] = useState('')
  const [time,      setTime]      = useState('')
  const [saving,    setSaving]    = useState(false)

  // Check if onboarding is needed
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/onboarding')
      .then(r => r.ok ? r.json() : { needed: false })
      .then(d => { if (d.needed) setShow(true) })
      .catch(() => {})
  }, [status])

  async function finish() {
    setSaving(true)
    await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, challenge, time }),
    }).catch(() => {})
    setShow(false)
    setSaving(false)
  }

  if (!show) return null

  const firstStep = FIRST_STEPS[goal]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden relative">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-teal-mid to-teal-deep transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Skip / close — always available, no trapped users */}
        <button
          onClick={finish}
          aria-label="Skip onboarding"
          title="Skip for now"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-text-mid hover:bg-gray-50 transition-colors text-[1rem]"
        >
          ✕
        </button>

        <div className="p-8">
          {/* ── Step 1: Goal ────────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <div className="text-center mb-6">
                <span className="text-[2.5rem] block mb-3">🌿</span>
                <h2 className="font-display text-[1.4rem] text-charcoal font-bold mb-2">
                  Welcome! What brings you here?
                </h2>
                <p className="text-text-mid text-[0.88rem]">
                  This helps us personalise your experience from day one.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 mb-6">
                {GOALS.map(g => (
                  <button
                    key={g.key}
                    onClick={() => setGoal(g.key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all
                      ${goal === g.key
                        ? 'bg-teal-ghost border-teal-mid shadow-sm'
                        : 'border-gray-200 hover:border-teal-light'}`}
                  >
                    <span className="text-[1.4rem] flex-shrink-0">{g.emoji}</span>
                    <div>
                      <p className="font-semibold text-charcoal text-[0.88rem]">{g.label}</p>
                      <p className="text-text-xlight text-[0.75rem]">{g.desc}</p>
                    </div>
                    {goal === g.key && (
                      <span className="ml-auto text-teal-deep text-lg flex-shrink-0">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => goal && setStep(2)}
                disabled={!goal}
                className="w-full bg-teal-deep text-white py-3.5 rounded-full font-semibold text-[0.95rem] hover:bg-teal-dark disabled:opacity-40 transition-colors"
              >
                Continue →
              </button>

              <button
                onClick={finish}
                disabled={saving}
                className="w-full text-text-xlight text-[0.75rem] mt-3 hover:text-text-mid transition-colors"
              >
                Skip for now — explore on my own
              </button>
            </>
          )}

          {/* ── Step 2: Challenge ───────────────────────────────────────── */}
          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <span className="text-[2.5rem] block mb-3">🤔</span>
                <h2 className="font-display text-[1.3rem] text-charcoal font-bold mb-2">
                  What feels hardest right now?
                </h2>
                <p className="text-text-mid text-[0.85rem]">
                  Pick what resonates most — we&apos;ll suggest tools that help.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {CHALLENGES.map(c => (
                  <button
                    key={c.key}
                    onClick={() => setChallenge(challenge === c.key ? '' : c.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[0.85rem] transition-all
                      ${challenge === c.key
                        ? 'bg-teal-deep text-white border-teal-deep'
                        : 'border-gray-200 text-text-mid hover:border-teal-light'}`}
                  >
                    <span>{c.emoji}</span> {c.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mb-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-text-mid py-3 rounded-full font-semibold text-[0.88rem] hover:border-teal-light transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-teal-deep text-white py-3 rounded-full font-semibold text-[0.88rem] hover:bg-teal-dark transition-colors"
                >
                  Continue →
                </button>
              </div>

              <button
                onClick={finish}
                disabled={saving}
                className="w-full text-text-xlight text-[0.75rem] mt-3 hover:text-text-mid transition-colors"
              >
                Skip for now — explore on my own
              </button>
            </>
          )}

          {/* ── Step 3: First step + time preference ───────────────────── */}
          {step === 3 && (
            <>
              <div className="text-center mb-5">
                <span className="text-[2.5rem] block mb-3">{firstStep?.emoji ?? '✨'}</span>
                <h2 className="font-display text-[1.3rem] text-charcoal font-bold mb-2">
                  Your personalised first step
                </h2>
              </div>

              {firstStep && (
                <div className="bg-teal-ghost border border-teal-light rounded-[16px] p-4 mb-5">
                  <p className="text-[0.9rem] text-charcoal leading-relaxed">{firstStep.action}</p>
                </div>
              )}

              <p className="text-[0.82rem] font-semibold text-text-mid mb-3">
                When do you prefer to check in?
              </p>
              <div className="flex gap-2 mb-6">
                {TIMES.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTime(t.key)}
                    className={`flex-1 py-2.5 rounded-xl border text-[0.78rem] font-medium text-center transition-all
                      ${time === t.key
                        ? 'bg-teal-deep text-white border-teal-deep'
                        : 'border-gray-200 text-text-mid hover:border-teal-light'}`}
                  >
                    {t.emoji}<br />{t.label.split(' — ')[0]}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-200 text-text-mid py-3 rounded-full font-semibold text-[0.88rem] hover:border-teal-light transition-colors"
                >
                  ← Back
                </button>
                {firstStep ? (
                  <Link
                    href={firstStep.href}
                    onClick={finish}
                    className="flex-1 bg-teal-deep text-white py-3 rounded-full font-semibold text-[0.88rem] hover:bg-teal-dark transition-colors text-center no-underline"
                  >
                    {saving ? '…' : "Let's Begin →"}
                  </Link>
                ) : (
                  <button
                    onClick={finish}
                    disabled={saving}
                    className="flex-1 bg-teal-deep text-white py-3 rounded-full font-semibold text-[0.88rem] hover:bg-teal-dark disabled:opacity-60 transition-colors"
                  >
                    {saving ? '…' : "Let's Begin →"}
                  </button>
                )}
              </div>

              <button
                onClick={finish}
                className="w-full text-text-xlight text-[0.75rem] mt-3 hover:text-text-mid transition-colors"
              >
                Skip for now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
