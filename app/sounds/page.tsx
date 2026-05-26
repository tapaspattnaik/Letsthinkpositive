'use client'

import { useState, useRef, useEffect } from 'react'

interface Sound {
  id:    string
  label: string
  icon:  string
  src:   string
}

const SOUNDS: Sound[] = [
  { id: 'rain',   label: 'Rain',          icon: '🌧️', src: '/sounds/rain.mp3'   },
  { id: 'forest', label: 'Forest',        icon: '🌲', src: '/sounds/forest.mp3' },
  { id: 'ocean',  label: 'Ocean Waves',   icon: '🌊', src: '/sounds/ocean.mp3'  },
  { id: 'bowls',  label: 'Tibetan Bowls', icon: '🎵', src: '/sounds/bowls.mp3'  },
  { id: 'fire',   label: 'Fireplace',     icon: '🔥', src: '/sounds/fire.mp3'   },
  { id: 'wind',   label: 'Wind',          icon: '💨', src: '/sounds/wind.mp3'   },
  { id: 'birds',  label: 'Birds',         icon: '🐦', src: '/sounds/birds.mp3'  },
  { id: 'binaural', label: 'Binaural',    icon: '🧠', src: '/sounds/binaural.mp3'},
]

const BREATHING = [
  { label: '4-7-8',       inhale: 4, hold: 7, exhale: 8, desc: 'Calming & sleep'    },
  { label: 'Box',         inhale: 4, hold: 4, exhale: 4, desc: 'Focus & balance'    },
  { label: 'Relaxing',    inhale: 4, hold: 0, exhale: 6, desc: 'Stress relief'      },
]

export default function SoundsPage() {
  const [volumes, setVolumes]   = useState<Record<string, number>>({})
  const [playing, setPlaying]   = useState<Record<string, boolean>>({})
  const [timer,   setTimer]     = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [breath,  setBreath]    = useState<typeof BREATHING[0] | null>(null)
  const [phase,   setPhase]     = useState('')
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})
  const timerRef  = useRef<ReturnType<typeof setInterval>>()

  function toggleSound(s: Sound) {
    if (!audioRefs.current[s.id]) {
      const a = new Audio(s.src)
      a.loop   = true
      a.volume = (volumes[s.id] ?? 0.6)
      audioRefs.current[s.id] = a
    }
    const audio = audioRefs.current[s.id]
    if (playing[s.id]) {
      audio.pause()
    } else {
      audio.play().catch(() => {/* browser autoplay policy */})
    }
    setPlaying(p => ({ ...p, [s.id]: !p[s.id] }))
  }

  function setVolume(id: string, v: number) {
    setVolumes(p => ({ ...p, [id]: v }))
    if (audioRefs.current[id]) audioRefs.current[id].volume = v
  }

  function startTimer(mins: number) {
    clearInterval(timerRef.current)
    setTimer(mins)
    setRemaining(mins * 60)
    timerRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(timerRef.current)
          Object.values(audioRefs.current).forEach(a => a.pause())
          setPlaying({})
          return 0
        }
        return r - 1
      })
    }, 1000)
  }

  useEffect(() => () => { clearInterval(timerRef.current) }, [])

  const anyPlaying = Object.values(playing).some(Boolean)

  return (
    <>
      <section className="bg-gradient-to-br from-[#0D3D3D] to-teal-deep py-16 px-[5%] text-white text-center">
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold mb-3">Keep Calm Sounds 🎧</h1>
        <p className="text-white/70 text-[1.05rem] max-w-[480px] mx-auto">
          Layer ambient sounds into your perfect calm space. Mix volumes, set a timer, breathe.
        </p>
      </section>

      <section className="py-12 px-[5%]">
        <div className="max-w-3xl mx-auto">
          {/* Sound grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {SOUNDS.map(s => (
              <div key={s.id} className={`bg-white rounded-[24px] p-5 border text-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lift
                ${playing[s.id] ? 'border-teal-mid shadow-lift' : 'border-teal-light shadow-card'}`}
                onClick={() => toggleSound(s)}>
                <span className="text-[2.2rem] block mb-2">{s.icon}</span>
                <p className={`text-[0.88rem] font-semibold mb-3 ${playing[s.id] ? 'text-teal-deep' : 'text-text-mid'}`}>{s.label}</p>
                {playing[s.id] && (
                  <input type="range" min={0} max={1} step={0.05}
                    value={volumes[s.id] ?? 0.6}
                    onChange={e => { e.stopPropagation(); setVolume(s.id, parseFloat(e.target.value)) }}
                    onClick={e => e.stopPropagation()}
                    className="w-full accent-teal-mid" />
                )}
                <span className={`text-[0.72rem] font-semibold tracking-wide ${playing[s.id] ? 'text-teal-mid' : 'text-text-xlight'}`}>
                  {playing[s.id] ? '▶ PLAYING' : 'TAP TO PLAY'}
                </span>
              </div>
            ))}
          </div>

          {/* Timer */}
          {anyPlaying && (
            <div className="bg-teal-ghost rounded-[24px] p-6 mb-8">
              <p className="text-[0.85rem] font-semibold text-teal-deep mb-3">Set a session timer</p>
              <div className="flex gap-3 flex-wrap items-center">
                {[5, 10, 15, 30].map(m => (
                  <button key={m} onClick={() => startTimer(m)}
                    className={`px-5 py-2 rounded-full border text-[0.85rem] font-medium transition-all
                      ${timer === m && remaining > 0 ? 'bg-teal-deep text-white border-teal-deep' : 'bg-white text-text-mid border-teal-light hover:border-teal-mid'}`}>
                    {m} min
                  </button>
                ))}
                {remaining > 0 && (
                  <span className="text-teal-mid font-semibold text-[0.95rem]">
                    ⏱ {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')} remaining
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Breathing guide */}
          <div className="bg-white rounded-[24px] p-7 border border-teal-light shadow-card">
            <h2 className="font-display text-[1.3rem] text-charcoal mb-4">Breathing Guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {BREATHING.map(b => (
                <button key={b.label} onClick={() => setBreath(breath?.label === b.label ? null : b)}
                  className={`rounded-card p-5 border text-left transition-all
                    ${breath?.label === b.label ? 'bg-teal-deep text-white border-teal-deep' : 'bg-teal-ghost border-teal-light hover:border-teal-mid'}`}>
                  <p className={`font-bold text-[0.95rem] mb-1 ${breath?.label === b.label ? 'text-white' : 'text-teal-deep'}`}>{b.label} Breathing</p>
                  <p className={`text-[0.8rem] ${breath?.label === b.label ? 'text-white/75' : 'text-text-light'}`}>{b.desc}</p>
                  <p className={`text-[0.75rem] mt-2 ${breath?.label === b.label ? 'text-amber-soft' : 'text-text-xlight'}`}>
                    Inhale {b.inhale}s {b.hold > 0 ? `· Hold ${b.hold}s ` : ''}· Exhale {b.exhale}s
                  </p>
                </button>
              ))}
            </div>
            {breath && (
              <div className="mt-6 p-6 bg-teal-ghost rounded-card text-center">
                <p className="text-teal-deep font-medium text-[1rem]">
                  Breathe in for <strong>{breath.inhale}s</strong>
                  {breath.hold > 0 && <> · Hold for <strong>{breath.hold}s</strong></>}
                  {' '}· Out for <strong>{breath.exhale}s</strong>
                </p>
                <p className="text-text-xlight text-[0.82rem] mt-1">Close your eyes and follow the rhythm. 🌿</p>
              </div>
            )}
          </div>

          <p className="text-center text-text-xlight text-[0.82rem] mt-6">
            Audio files will play once uploaded to <code>/public/sounds/</code>
          </p>
        </div>
      </section>
    </>
  )
}
