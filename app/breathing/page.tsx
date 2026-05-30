'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const EXERCISES = [
  {
    id: 'box', name: 'Box Breathing', emoji: '📦',
    desc: 'Equal counts — calm the nervous system',
    intro: 'Box breathing calms your nervous system. Each phase is equal — four counts each.',
    phases: [
      { label: 'Inhale', voice: 'Breathe in',       secs: 4, color: '#0d9488' },
      { label: 'Hold',   voice: 'Hold',              secs: 4, color: '#f59e0b' },
      { label: 'Exhale', voice: 'Breathe out',       secs: 4, color: '#6366f1' },
      { label: 'Hold',   voice: 'Hold gently',       secs: 4, color: '#8b5cf6' },
    ],
  },
  {
    id: '4-7-8', name: '4-7-8 Breathing', emoji: '🌙',
    desc: 'Reduce anxiety & prepare for sleep',
    intro: 'Four-seven-eight breathing reduces anxiety and helps you sleep. Inhale for four, hold for seven, and exhale slowly for eight.',
    phases: [
      { label: 'Inhale', voice: 'Breathe in',         secs: 4, color: '#0d9488' },
      { label: 'Hold',   voice: 'Hold',                secs: 7, color: '#f59e0b' },
      { label: 'Exhale', voice: 'Breathe out slowly',  secs: 8, color: '#6366f1' },
    ],
  },
  {
    id: 'calm', name: 'Calm Breath', emoji: '🌊',
    desc: 'Extended exhale to activate rest mode',
    intro: 'Calm breath extends your exhale to activate your body\'s rest mode. Inhale for four, exhale for six.',
    phases: [
      { label: 'Inhale', voice: 'Breathe in',         secs: 4, color: '#0d9488' },
      { label: 'Exhale', voice: 'Breathe out slowly',  secs: 6, color: '#6366f1' },
    ],
  },
  {
    id: 'energise', name: 'Energising Breath', emoji: '⚡',
    desc: 'Quick reset — boost focus and energy',
    intro: 'Energising breath boosts your focus and alertness. Breathe in deeply for six counts, then release quickly.',
    phases: [
      { label: 'Inhale', voice: 'Breathe in deeply',  secs: 6, color: '#0d9488' },
      { label: 'Exhale', voice: 'Release',             secs: 2, color: '#6366f1' },
    ],
  },
  {
    id: 'diaphragm', name: 'Belly Breathing', emoji: '🫁',
    desc: 'Deep diaphragmatic breathing for full relaxation',
    intro: 'Belly breathing uses your diaphragm fully. Place one hand on your belly. Feel it rise as you inhale and fall as you exhale.',
    phases: [
      { label: 'Inhale', voice: 'Breathe into your belly', secs: 5, color: '#0d9488' },
      { label: 'Hold',   voice: 'Hold',                     secs: 2, color: '#f59e0b' },
      { label: 'Exhale', voice: 'Let it all go',            secs: 7, color: '#6366f1' },
    ],
  },
]

type ExerciseType = typeof EXERCISES[0]

// ── Speech helper ────────────────────────────────────────────────────────────
function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const utterRef  = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string, rate = 0.82, pitch = 0.9, volume = 1) => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const utt   = new SpeechSynthesisUtterance(text)
    utt.rate    = rate
    utt.pitch   = pitch
    utt.volume  = volume
    // Prefer a female English voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('karen') || v.name.toLowerCase().includes('moira') || v.name.toLowerCase().includes('victoria'))
    ) ?? voices.find(v => v.lang.startsWith('en')) ?? null
    if (preferred) utt.voice = preferred
    utterRef.current = utt
    window.speechSynthesis.speak(utt)
  }, [supported])

  const cancel = useCallback(() => {
    if (supported) window.speechSynthesis.cancel()
  }, [supported])

  return { speak, cancel, supported }
}

export default function BreathingPage() {
  const [selected,  setSelected]  = useState<ExerciseType>(EXERCISES[0])
  const [running,   setRunning]   = useState(false)
  const [phaseIdx,  setPhaseIdx]  = useState(0)
  const [countdown, setCountdown] = useState(EXERCISES[0].phases[0].secs)
  const [cycles,    setCycles]    = useState(0)
  const [voice,     setVoice]     = useState(true)   // voice guide on by default
  const [started,   setStarted]   = useState(false)  // tracks if session has begun

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseIdxRef = useRef(0)   // mirror for use inside interval
  const countRef    = useRef(EXERCISES[0].phases[0].secs)
  const { speak, cancel, supported } = useSpeech()

  // ── Speak phase announcement ────────────────────────────────────────────
  const announcePhase = useCallback((ex: ExerciseType, idx: number) => {
    if (!voice) return
    speak(ex.phases[idx].voice)
  }, [voice, speak])

  // ── Count down aloud (last 3 secs of a phase) ───────────────────────────
  const announceCount = useCallback((n: number) => {
    if (!voice) return
    if (n <= 3 && n > 0) speak(String(n), 0.95, 1.0, 0.6)
  }, [voice, speak])

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    cancel()
    setRunning(false)
    setStarted(false)
    setPhaseIdx(0)
    setCountdown(selected.phases[0].secs)
    setCycles(0)
    phaseIdxRef.current  = 0
    countRef.current     = selected.phases[0].secs
  }, [selected, cancel])

  const start = useCallback(() => {
    phaseIdxRef.current = 0
    countRef.current    = selected.phases[0].secs
    setPhaseIdx(0)
    setCountdown(selected.phases[0].secs)
    setCycles(0)
    setRunning(true)
    setStarted(true)

    // Intro speech + first phase announcement
    if (voice) {
      speak('Let\'s begin. ' + selected.intro + ' Get comfortable, close your eyes, and follow along.')
      setTimeout(() => {
        speak(selected.phases[0].voice)
      }, (selected.intro.split(' ').length / 2.5 + 4) * 1000)
    } else {
      // no voice — just announce first phase silently (screen reader)
    }
  }, [selected, voice, speak])

  useEffect(() => {
    if (!running) return

    intervalRef.current = setInterval(() => {
      countRef.current -= 1
      const newCount = countRef.current

      setCountdown(newCount)

      // Announce countdown numbers (last 3 secs)
      if (newCount <= 3 && newCount > 0) {
        announceCount(newCount)
      }

      if (newCount <= 0) {
        // Advance phase
        const currentIdx = phaseIdxRef.current
        const nextIdx    = (currentIdx + 1) % selected.phases.length
        const isNewCycle = nextIdx === 0

        phaseIdxRef.current  = nextIdx
        countRef.current     = selected.phases[nextIdx].secs

        setPhaseIdx(nextIdx)
        setCountdown(selected.phases[nextIdx].secs)
        if (isNewCycle) setCycles(c => c + 1)

        // Announce next phase (after a tiny delay so count doesn't overlap)
        setTimeout(() => announcePhase(selected, nextIdx), 300)
      }
    }, 1000)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, selected, announcePhase, announceCount])

  // Re-announce when voice is toggled on mid-session
  useEffect(() => {
    if (running && voice) announcePhase(selected, phaseIdx)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice])

  function selectExercise(ex: ExerciseType) {
    stop()
    setSelected(ex)
    setCountdown(ex.phases[0].secs)
    phaseIdxRef.current = 0
    countRef.current    = ex.phases[0].secs
  }

  const phase        = selected.phases[phaseIdx]
  const totalSecs    = selected.phases.reduce((a, p) => a + p.secs, 0)
  const elapsedInCycle = selected.phases.slice(0, phaseIdx).reduce((a, p) => a + p.secs, 0)
    + (phase.secs - countdown)
  const progressPct  = running ? (elapsedInCycle / totalSecs) * 100 : 0

  const isInhale     = phase.label === 'Inhale'
  const isExhale     = phase.label === 'Exhale'
  const circleScale  = running
    ? isInhale  ? 1 + (1 - countdown / phase.secs) * 0.35
    : isExhale  ? 1.35 - (1 - countdown / phase.secs) * 0.35
    : 1.35
    : 1

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a3333] to-[#061e1e] flex flex-col">

      {/* Header */}
      <div className="px-[5%] pt-12 pb-4 text-center relative">
        <p className="text-teal-mid text-[0.78rem] font-semibold tracking-[0.2em] uppercase mb-3">Breathing Exercises</p>
        <h1 className="font-display text-[2rem] font-bold text-white mb-2">Breathe with intention</h1>
        <p className="text-white/50 text-[0.9rem]">A few conscious breaths can shift everything.</p>

        {/* Voice toggle */}
        {supported && (
          <div className="absolute top-12 right-[5%]">
            <button
              onClick={() => { setVoice(v => !v); if (running) cancel() }}
              title={voice ? 'Turn off voice guide' : 'Turn on voice guide'}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-[0.8rem] font-semibold transition-all
                ${voice
                  ? 'bg-teal-mid/20 border-teal-mid text-teal-mid hover:bg-teal-mid/30'
                  : 'bg-white/5 border-white/20 text-white/40 hover:border-white/30 hover:text-white/60'}`}>
              {voice ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75" />
                </svg>
              )}
              <span className="hidden sm:inline">{voice ? 'Voice On' : 'Voice Off'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Voice guide info banner */}
      {voice && supported && !started && (
        <div className="mx-[5%] mb-2 bg-teal-mid/10 border border-teal-mid/30 rounded-[14px] px-4 py-2.5 text-center">
          <p className="text-teal-mid text-[0.78rem] font-medium">
            🎙️ Voice guide is on — a calm voice will guide you through each phase and count down the last 3 seconds.
          </p>
        </div>
      )}
      {!supported && (
        <div className="mx-[5%] mb-2 bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-center">
          <p className="text-white/40 text-[0.75rem]">Voice guide is not supported in this browser. Try Chrome or Safari for the best experience.</p>
        </div>
      )}

      {/* Exercise selector */}
      <div className="flex gap-2 overflow-x-auto px-[5%] pb-3 justify-center flex-wrap">
        {EXERCISES.map(ex => (
          <button key={ex.id} onClick={() => selectExercise(ex)}
            aria-pressed={selected.id === ex.id}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[0.82rem] font-semibold border transition-all
              ${selected.id === ex.id
                ? 'bg-teal-mid/30 border-teal-mid text-teal-mid'
                : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'}`}>
            {ex.emoji} {ex.name}
          </button>
        ))}
      </div>

      {/* Main breathing circle */}
      <div className="flex-1 flex flex-col items-center justify-center px-[5%] py-6">

        {/* Progress arc */}
        <div className="relative mb-2 w-full flex justify-center">
          <svg className="absolute" width="320" height="8" style={{ top: '-12px' }}>
            <rect x="0" y="0" width="320" height="8" rx="4" fill="rgba(255,255,255,0.06)" />
            <rect x="0" y="0" width={`${progressPct * 3.2}px`} height="8" rx="4"
              fill={running ? phase.color : 'transparent'}
              style={{ transition: 'width 0.9s linear' }} />
          </svg>
        </div>

        {/* Circle */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer glow */}
          <div className="absolute rounded-full transition-all duration-1000 ease-in-out"
            style={{ width: `${280 * circleScale}px`, height: `${280 * circleScale}px`,
              background: running ? `${phase.color}15` : 'transparent',
              border:     running ? `2px solid ${phase.color}40` : '2px solid rgba(255,255,255,0.1)' }} />
          {/* Middle ring */}
          <div className="absolute rounded-full transition-all duration-1000 ease-in-out"
            style={{ width: `${220 * (circleScale * 0.9)}px`, height: `${220 * (circleScale * 0.9)}px`,
              background: running ? `${phase.color}25` : 'rgba(255,255,255,0.03)',
              border:     running ? `2px solid ${phase.color}60` : '2px solid rgba(255,255,255,0.08)' }} />
          {/* Inner core */}
          <div className="relative rounded-full transition-all duration-1000 ease-in-out flex flex-col items-center justify-center z-10"
            style={{ width: `${160 * circleScale}px`, height: `${160 * circleScale}px`,
              background: running ? phase.color : 'rgba(255,255,255,0.08)',
              boxShadow:  running ? `0 0 40px ${phase.color}60` : 'none' }}>
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
        <div className="flex gap-4 mb-6 flex-wrap justify-center">
          {selected.phases.map((p, i) => (
            <div key={i}
              className={`flex flex-col items-center transition-all ${running && i === phaseIdx ? 'opacity-100 scale-110' : 'opacity-40'}`}>
              <div className="w-2 h-2 rounded-full mb-1" style={{ background: p.color }} />
              <span className="text-white/70 text-[0.7rem]">{p.label}</span>
              <span className="text-white/50 text-[0.65rem]">{p.secs}s</span>
            </div>
          ))}
        </div>

        {/* Intro description */}
        {!running && (
          <p className="text-white/50 text-[0.85rem] text-center mb-5 max-w-[360px] leading-[1.7]">{selected.desc}</p>
        )}

        {/* Cycle counter */}
        {running && cycles > 0 && (
          <p className="text-teal-mid text-[0.82rem] font-semibold mb-4">
            {cycles} {cycles === 1 ? 'cycle' : 'cycles'} complete ✓
          </p>
        )}

        {/* Voice cue label during exercise */}
        {running && voice && supported && (
          <div className="flex items-center gap-2 mb-4 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-mid animate-pulse" />
            <span className="text-teal-mid text-[0.75rem] font-medium">Voice guide active</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-4 items-center">
          {!running ? (
            <button onClick={start}
              className="bg-teal-mid text-white px-10 py-4 rounded-full font-semibold text-[1rem] hover:bg-teal-deep transition-all hover:scale-105 shadow-lg shadow-teal-mid/20">
              {voice && supported ? '🎙️ Begin with Voice' : 'Begin'}
            </button>
          ) : (
            <button onClick={stop}
              className="bg-white/10 text-white border border-white/20 px-10 py-4 rounded-full font-semibold text-[1rem] hover:bg-white/20 transition-all">
              Stop
            </button>
          )}
        </div>

        {/* Screen reader live region */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {running ? `${phase.label} — ${countdown} seconds` : ''}
        </div>

        {!running && !started && (
          <p className="text-white/30 text-[0.75rem] text-center mt-5 max-w-[300px] leading-[1.7]">
            {voice && supported
              ? 'A calm voice will guide you through each phase. Find a comfortable position, close your eyes, and follow along.'
              : 'Find a comfortable seated position, close your eyes, and follow the rhythm.'}
          </p>
        )}
      </div>

      {/* Benefits strip */}
      <div className="border-t border-white/8 px-[5%] py-8">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { icon: '❤️', label: 'Lowers heart rate' },
            { icon: '🧠', label: 'Calms the mind'   },
            { icon: '😴', label: 'Improves sleep'    },
            { icon: '⚡', label: 'Boosts focus'      },
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
