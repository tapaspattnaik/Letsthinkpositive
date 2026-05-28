'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const EXERCISES = [
  {
    id:    'box',
    name:  'Box Breathing',
    emoji: '📦',
    desc:  'Equal counts — calm the nervous system',
    phases: [
      { label: 'Inhale',     secs: 4, color: '#0d9488' },
      { label: 'Hold',       secs: 4, color: '#f59e0b' },
      { label: 'Exhale',     secs: 4, color: '#6366f1' },
      { label: 'Hold',       secs: 4, color: '#8b5cf6' },
    ],
  },
  {
    id:    '4-7-8',
    name:  '4-7-8 Breathing',
    emoji: '🌙',
    desc:  'Reduce anxiety & prepare for sleep',
    phases: [
      { label: 'Inhale',  secs: 4, color: '#0d9488' },
      { label: 'Hold',    secs: 7, color: '#f59e0b' },
      { label: 'Exhale',  secs: 8, color: '#6366f1' },
    ],
  },
  {
    id:    'calm',
    name:  'Calm Breath',
    emoji: '🌊',
    desc:  'Extended exhale to activate rest mode',
    phases: [
      { label: 'Inhale',  secs: 4, color: '#0d9488' },
      { label: 'Exhale',  secs: 6, color: '#6366f1' },
    ],
  },
  {
    id:    'energise',
    name:  'Energising Breath',
    emoji: '⚡',
    desc:  'Quick reset — boost focus and energy',
    phases: [
      { label: 'Inhale',  secs: 6, color: '#0d9488' },
      { label: 'Exhale',  secs: 2, color: '#6366f1' },
    ],
  },
]

type ExerciseType = typeof EXERCISES[0]

export default function BreathingPage() {
  const [selected,    setSelected]    = useState<ExerciseType>(EXERCISES[0])
  const [running,     setRunning]     = useState(false)
  const [phaseIdx,    setPhaseIdx]    = useState(0)
  const [countdown,   setCountdown]   = useState(EXERCISES[0].phases[0].secs)
  const [cycles,      setCycles]      = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    setPhaseIdx(0)
    setCountdown(selected.phases[0].secs)
    setCycles(0)
  }, [selected])

  const start = useCallback(() => {
    setPhaseIdx(0)
    setCountdown(selected.phases[0].secs)
    setCycles(0)
    setRunning(true)
  }, [selected])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev > 1) return prev - 1
        // Schedule phase advance asynchronously to avoid nested setState
        setTimeout(() => {
          setPhaseIdx(idx => {
            const next = (idx + 1) % selected.phases.length
            if (next === 0) setCycles(c => c + 1)
            setCountdown(selected.phases[next].secs)
            return next
          })
        }, 0)
        return 1 // will be replaced by the setPhaseIdx callback
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, selected])

  // Switch exercise → reset
  function selectExercise(ex: ExerciseType) {
    stop()
    setSelected(ex)
    setCountdown(ex.phases[0].secs)
  }

  const phase        = selected.phases[phaseIdx]
  const totalSecs    = selected.phases.reduce((a, p) => a + p.secs, 0)
  const elapsedInCycle = selected.phases.slice(0, phaseIdx).reduce((a, p) => a + p.secs, 0)
    + (phase.secs - countdown)
  const progressPct  = running ? (elapsedInCycle / totalSecs) * 100 : 0

  // Scale for the circle: 0.75 on hold/exhale, 1 on inhale
  const isInhale  = phase.label === 'Inhale'
  const isExhale  = phase.label === 'Exhale'
  const circleScale = running
    ? (isInhale
        ? 1 + (1 - countdown / phase.secs) * 0.35
        : isExhale
          ? 1.35 - (1 - countdown / phase.secs) * 0.35
          : 1.35)
    : 1

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a3333] to-[#061e1e] flex flex-col">

      {/* Header */}
      <div className="px-[5%] pt-12 pb-6 text-center">
        <p className="text-teal-mid text-[0.78rem] font-semibold tracking-[0.2em] uppercase mb-3">Breathing Exercises</p>
        <h1 className="font-display text-[2rem] font-bold text-white mb-2">Breathe with intention</h1>
        <p className="text-white/50 text-[0.9rem]">A few conscious breaths can shift everything.</p>
      </div>

      {/* Exercise selector */}
      <div className="flex gap-3 overflow-x-auto px-[5%] pb-2 justify-center flex-wrap">
        {EXERCISES.map(ex => (
          <button
            key={ex.id}
            onClick={() => selectExercise(ex)}
            aria-pressed={selected.id === ex.id}
            aria-label={`${ex.name}: ${ex.desc}`}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[0.82rem] font-semibold border transition-all ${
              selected.id === ex.id
                ? 'bg-teal-mid/30 border-teal-mid text-teal-mid'
                : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'
            }`}
          >
            {ex.emoji} {ex.name}
          </button>
        ))}
      </div>

      {/* Main breathing circle */}
      <div className="flex-1 flex flex-col items-center justify-center px-[5%] py-8">

        {/* Circle */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer glow ring */}
          <div
            className="absolute rounded-full transition-all duration-1000 ease-in-out"
            style={{
              width:  `${280 * circleScale}px`,
              height: `${280 * circleScale}px`,
              background: running ? `${phase.color}15` : 'transparent',
              border:     running ? `2px solid ${phase.color}40` : '2px solid rgba(255,255,255,0.1)',
            }}
          />
          {/* Middle ring */}
          <div
            className="absolute rounded-full transition-all duration-1000 ease-in-out"
            style={{
              width:  `${220 * (circleScale * 0.9)}px`,
              height: `${220 * (circleScale * 0.9)}px`,
              background: running ? `${phase.color}25` : 'rgba(255,255,255,0.03)',
              border:     running ? `2px solid ${phase.color}60` : '2px solid rgba(255,255,255,0.08)',
            }}
          />
          {/* Inner core */}
          <div
            className="relative rounded-full transition-all duration-1000 ease-in-out flex flex-col items-center justify-center z-10"
            style={{
              width:      `${160 * circleScale}px`,
              height:     `${160 * circleScale}px`,
              background: running ? phase.color : 'rgba(255,255,255,0.08)',
              boxShadow:  running ? `0 0 40px ${phase.color}60` : 'none',
            }}
          >
            {running ? (
              <>
                <span className="text-white font-bold text-[2.5rem] leading-none">{countdown}</span>
                <span className="text-white/80 text-[0.85rem] font-semibold mt-1">{phase.label}</span>
              </>
            ) : (
              <span className="text-white/40 text-[3rem]">{selected.emoji}</span>
            )}
          </div>
        </div>

        {/* Phase indicators */}
        <div className="flex gap-4 mb-8 flex-wrap justify-center">
          {selected.phases.map((p, i) => (
            <div key={i}
              className={`flex flex-col items-center transition-all ${running && i === phaseIdx ? 'opacity-100 scale-110' : 'opacity-40'}`}>
              <div className="w-2 h-2 rounded-full mb-1" style={{ background: p.color }} />
              <span className="text-white/70 text-[0.7rem]">{p.label}</span>
              <span className="text-white/50 text-[0.65rem]">{p.secs}s</span>
            </div>
          ))}
        </div>

        {/* Description */}
        <p className="text-white/50 text-[0.85rem] text-center mb-6 max-w-[300px]">{selected.desc}</p>

        {/* Cycle counter */}
        {running && cycles > 0 && (
          <p className="text-teal-mid text-[0.82rem] font-semibold mb-4">
            {cycles} {cycles === 1 ? 'cycle' : 'cycles'} complete
          </p>
        )}

        {/* Controls */}
        <div className="flex gap-4">
          {!running ? (
            <button
              onClick={start}
              aria-label={`Begin ${selected.name}`}
              className="bg-teal-mid text-white px-10 py-4 rounded-full font-semibold text-[1rem] hover:bg-teal-deep transition-all hover:scale-105">
              Begin
            </button>
          ) : (
            <button
              onClick={stop}
              aria-label="Stop breathing exercise"
              className="bg-white/10 text-white border border-white/20 px-10 py-4 rounded-full font-semibold text-[1rem] hover:bg-white/20 transition-all">
              Stop
            </button>
          )}
        </div>
        {/* Live region for screen reader announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {running ? `${phase.label} — ${countdown} seconds` : ''}
        </div>

        {/* Tip */}
        {!running && (
          <p className="text-white/30 text-[0.78rem] text-center mt-6 max-w-[280px]">
            Find a comfortable seated position, close your eyes, and follow the rhythm.
          </p>
        )}
      </div>

      {/* Benefits strip */}
      <div className="border-t border-white/8 px-[5%] py-8">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { icon: '❤️', label: 'Lowers heart rate' },
            { icon: '🧠', label: 'Calms the mind' },
            { icon: '😴', label: 'Improves sleep' },
            { icon: '⚡', label: 'Boosts focus' },
          ].map(b => (
            <div key={b.label}>
              <p className="text-[1.5rem] mb-1">{b.icon}</p>
              <p className="text-white/40 text-[0.78rem]">{b.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
