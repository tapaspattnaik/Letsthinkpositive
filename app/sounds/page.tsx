'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// ── Web Audio synthesis — no MP3 files needed ─────────────────────────────────
// Each sound is generated procedurally so the page works out of the box
// with no external dependencies or copyright concerns.

interface SoundDef {
  id: string; label: string; icon: string; color: string
  build: (ctx: AudioContext, dest: AudioNode) => AudioNode[]
}

function makeNoise(ctx: AudioContext, type: 'white' | 'pink' | 'brown' = 'white'): AudioBufferSourceNode {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
  const data = buf.getChannelData(0)
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0
  for (let i = 0; i < data.length; i++) {
    const w = Math.random() * 2 - 1
    if (type === 'white') { data[i] = w }
    else if (type === 'pink') {
      b0=.99886*b0+w*.0555179; b1=.99332*b1+w*.0750759
      b2=.96900*b2+w*.1538520; b3=.86650*b3+w*.3104856
      b4=.55000*b4+w*.5329522; b5=-.7616*b5-w*.0168980
      data[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*0.11
      b6=w*0.115926
    } else {
      b0=(b0+.02*w)/1.02; data[i]=b0*4
    }
  }
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; return src
}

function lfo(ctx: AudioContext, freq: number, min: number, max: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.value = freq
  gain.gain.value = (max - min) / 2
  osc.connect(gain)
  osc.start()
  return { osc, gain, offset: (max + min) / 2 }
}

const SOUNDS: SoundDef[] = [
  {
    id: 'rain', label: 'Rain', icon: '🌧️', color: 'from-slate-400 to-blue-500',
    build(ctx, dest) {
      const noise = makeNoise(ctx, 'pink')
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'; filter.frequency.value = 1000; filter.Q.value = 0.5
      const gain = ctx.createGain(); gain.gain.value = 0.7
      noise.connect(filter); filter.connect(gain); gain.connect(dest); noise.start()
      // Add occasional heavier drops
      const dropFilter = ctx.createBiquadFilter()
      dropFilter.type = 'highpass'; dropFilter.frequency.value = 3000
      const drop = makeNoise(ctx, 'white')
      const dropGain = ctx.createGain(); dropGain.gain.value = 0.15
      drop.connect(dropFilter); dropFilter.connect(dropGain); dropGain.connect(dest); drop.start()
      return [noise, drop]
    },
  },
  {
    id: 'ocean', label: 'Ocean Waves', icon: '🌊', color: 'from-blue-500 to-teal-600',
    build(ctx, dest) {
      const noise = makeNoise(ctx, 'brown')
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'; filter.frequency.value = 500
      const gain = ctx.createGain(); gain.gain.value = 0.8
      // Wave LFO — slow 0.1Hz swell
      const wave = lfo(ctx, 0.1, 0.3, 0.9)
      noise.connect(filter); filter.connect(gain)
      wave.gain.connect(gain.gain)
      gain.gain.value = wave.offset
      gain.connect(dest); noise.start(); return [noise, wave.osc]
    },
  },
  {
    id: 'forest', label: 'Forest', icon: '🌲', color: 'from-green-600 to-teal-700',
    build(ctx, dest) {
      // Wind layer
      const wind = makeNoise(ctx, 'pink')
      const windF = ctx.createBiquadFilter()
      windF.type = 'lowpass'; windF.frequency.value = 300
      const windG = ctx.createGain(); windG.gain.value = 0.25
      wind.connect(windF); windF.connect(windG); windG.connect(dest); wind.start()
      // Rustling leaves layer
      const rustle = makeNoise(ctx, 'white')
      const rustleF = ctx.createBiquadFilter()
      rustleF.type = 'bandpass'; rustleF.frequency.value = 4000; rustleF.Q.value = 2
      const rustleG = ctx.createGain(); rustleG.gain.value = 0.08
      rustle.connect(rustleF); rustleF.connect(rustleG); rustleG.connect(dest); rustle.start()
      // Occasional bird chirps
      function chirp() {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'sine'
        const baseFreq = 1800 + Math.random() * 1200
        o.frequency.setValueAtTime(baseFreq, ctx.currentTime)
        o.frequency.linearRampToValueAtTime(baseFreq * 1.3, ctx.currentTime + 0.08)
        o.frequency.linearRampToValueAtTime(baseFreq, ctx.currentTime + 0.16)
        g.gain.setValueAtTime(0, ctx.currentTime)
        g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02)
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18)
        o.connect(g); g.connect(dest); o.start(); o.stop(ctx.currentTime + 0.2)
        setTimeout(chirp, 3000 + Math.random() * 7000)
      }
      setTimeout(chirp, 1500)
      return [wind, rustle]
    },
  },
  {
    id: 'bowls', label: 'Tibetan Bowls', icon: '🎵', color: 'from-amber-500 to-orange-600',
    build(ctx, dest) {
      const freqs = [432, 528, 639, 741, 852]
      const nodes: AudioNode[] = []
      freqs.forEach((freq, i) => {
        function ring() {
          const o = ctx.createOscillator()
          const g = ctx.createGain()
          o.type = 'sine'; o.frequency.value = freq
          g.gain.setValueAtTime(0, ctx.currentTime)
          g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1)
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 6)
          o.connect(g); g.connect(dest); o.start(); o.stop(ctx.currentTime + 6.5)
          nodes.push(o)
          setTimeout(ring, 8000 + i * 2000 + Math.random() * 4000)
        }
        setTimeout(ring, i * 1500)
      })
      return nodes
    },
  },
  {
    id: 'fire', label: 'Fireplace', icon: '🔥', color: 'from-orange-600 to-red-700',
    build(ctx, dest) {
      const noise = makeNoise(ctx, 'pink')
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'; filter.frequency.value = 800
      const gain = ctx.createGain(); gain.gain.value = 0.5
      const crackle = makeNoise(ctx, 'white')
      const crackleF = ctx.createBiquadFilter()
      crackleF.type = 'peaking'; crackleF.frequency.value = 2000; crackleF.gain.value = 8
      const crackleG = ctx.createGain(); crackleG.gain.value = 0.06
      // Flicker LFO
      const flicker = lfo(ctx, 3.5, 0.3, 0.7)
      noise.connect(filter); filter.connect(gain)
      flicker.gain.connect(gain.gain); gain.gain.value = flicker.offset
      gain.connect(dest); noise.start()
      crackle.connect(crackleF); crackleF.connect(crackleG); crackleG.connect(dest); crackle.start()
      return [noise, crackle, flicker.osc]
    },
  },
  {
    id: 'wind', label: 'Wind', icon: '💨', color: 'from-sky-400 to-slate-500',
    build(ctx, dest) {
      const noise = makeNoise(ctx, 'pink')
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'; filter.frequency.value = 400
      const gain = ctx.createGain()
      const swell = lfo(ctx, 0.07, 0.2, 0.8)
      swell.gain.connect(gain.gain); gain.gain.value = swell.offset
      noise.connect(filter); filter.connect(gain); gain.connect(dest); noise.start()
      // High whistle
      const whistle = makeNoise(ctx, 'white')
      const wF = ctx.createBiquadFilter()
      wF.type = 'bandpass'; wF.frequency.value = 2200; wF.Q.value = 8
      const wG = ctx.createGain(); wG.gain.value = 0.04
      const wSwell = lfo(ctx, 0.13, 0, 0.08)
      wSwell.gain.connect(wG.gain)
      whistle.connect(wF); wF.connect(wG); wG.connect(dest); whistle.start()
      return [noise, whistle, swell.osc, wSwell.osc]
    },
  },
  {
    id: 'birds', label: 'Birds', icon: '🐦', color: 'from-yellow-400 to-green-500',
    build(ctx, dest) {
      // Gentle dawn chorus
      const birdTypes = [
        { base: 2800, range: 400, speed: 0.12, count: 3 },
        { base: 1600, range: 200, speed: 0.2,  count: 2 },
        { base: 3400, range: 600, speed: 0.08, count: 4 },
      ]
      const bgNoise = makeNoise(ctx, 'pink')
      const bgF = ctx.createBiquadFilter(); bgF.type = 'highpass'; bgF.frequency.value = 2000
      const bgG = ctx.createGain(); bgG.gain.value = 0.04
      bgNoise.connect(bgF); bgF.connect(bgG); bgG.connect(dest); bgNoise.start()

      function songBird(base: number, range: number, speed: number, count: number) {
        const o = ctx.createOscillator(); const g = ctx.createGain()
        o.type = 'sine'
        let t = ctx.currentTime
        for (let i = 0; i < count; i++) {
          const f = base + Math.random() * range
          o.frequency.setValueAtTime(f, t)
          o.frequency.linearRampToValueAtTime(f * 1.25, t + speed * 0.6)
          o.frequency.linearRampToValueAtTime(f, t + speed)
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.1, t + 0.02)
          g.gain.setValueAtTime(0.1, t + speed - 0.04); g.gain.linearRampToValueAtTime(0, t + speed)
          t += speed + 0.05
        }
        o.connect(g); g.connect(dest); o.start(); o.stop(t + 0.1)
        setTimeout(() => songBird(base, range, speed, count), 3000 + Math.random() * 6000)
      }
      birdTypes.forEach((b, i) => setTimeout(() => songBird(b.base, b.range, b.speed, b.count), i * 800))
      return [bgNoise]
    },
  },
  {
    id: 'binaural', label: 'Binaural Beats', icon: '🧠', color: 'from-purple-600 to-indigo-700',
    build(ctx, dest) {
      // 7Hz theta binaural — left ear 200Hz, right ear 207Hz
      // Creates a perceived 7Hz beat that promotes relaxation
      const splitter = ctx.createChannelSplitter(2)
      const merger = ctx.createChannelMerger(2)
      const carrier = 200
      const beat = 7  // theta range: 4–8Hz (relaxation, creativity)

      const oL = ctx.createOscillator(); const gL = ctx.createGain()
      oL.type = 'sine'; oL.frequency.value = carrier; gL.gain.value = 0.25
      oL.connect(gL)

      const oR = ctx.createOscillator(); const gR = ctx.createGain()
      oR.type = 'sine'; oR.frequency.value = carrier + beat; gR.gain.value = 0.25
      oR.connect(gR)

      // Sine harmonics for depth
      const oH = ctx.createOscillator(); const gH = ctx.createGain()
      oH.type = 'sine'; oH.frequency.value = carrier * 2; gH.gain.value = 0.06
      oH.connect(gH)

      // Route L to left, R to right channels
      gL.connect(merger, 0, 0); gR.connect(merger, 0, 1); gH.connect(merger, 0, 0)
      merger.connect(dest)
      oL.start(); oR.start(); oH.start()
      return [oL, oR, oH]
    },
  },
]

const BREATHING = [
  { label: '4-7-8',    inhale: 4, hold: 7, exhale: 8, desc: 'Calming & sleep'  },
  { label: 'Box',      inhale: 4, hold: 4, exhale: 4, desc: 'Focus & balance'  },
  { label: 'Relaxing', inhale: 4, hold: 0, exhale: 6, desc: 'Stress relief'    },
]

export default function SoundsPage() {
  const [volumes,   setVolumes]   = useState<Record<string, number>>({})
  const [playing,   setPlaying]   = useState<Record<string, boolean>>({})
  const [timer,     setTimer]     = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [breath,    setBreath]    = useState<typeof BREATHING[0] | null>(null)

  const ctxRef    = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const nodesRef  = useRef<Record<string, AudioNode[]>>({})
  const gainRef   = useRef<Record<string, GainNode>>({})
  const timerRef  = useRef<ReturnType<typeof setInterval>>()

  function getCtx() {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      const ctx = new AudioContext()
      const master = ctx.createGain(); master.connect(ctx.destination)
      ctxRef.current = ctx; masterRef.current = master
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return { ctx: ctxRef.current, master: masterRef.current! }
  }

  function toggleSound(s: SoundDef) {
    if (playing[s.id]) {
      // Stop
      nodesRef.current[s.id]?.forEach(n => {
        try { (n as OscillatorNode).stop?.() } catch {}
        try { n.disconnect() } catch {}
      })
      delete nodesRef.current[s.id]
      delete gainRef.current[s.id]
      setPlaying(p => ({ ...p, [s.id]: false }))
    } else {
      // Start
      const { ctx, master } = getCtx()
      const gain = ctx.createGain()
      gain.gain.value = volumes[s.id] ?? 0.6
      gain.connect(master)
      gainRef.current[s.id] = gain
      const nodes = s.build(ctx, gain)
      nodesRef.current[s.id] = nodes
      setPlaying(p => ({ ...p, [s.id]: true }))
    }
  }

  function setVolume(id: string, v: number) {
    setVolumes(p => ({ ...p, [id]: v }))
    if (gainRef.current[id]) gainRef.current[id].gain.value = v
  }

  const stopAll = useCallback(() => {
    Object.keys(nodesRef.current).forEach(id => {
      nodesRef.current[id]?.forEach(n => {
        try { (n as OscillatorNode).stop?.() } catch {}
        try { n.disconnect() } catch {}
      })
    })
    nodesRef.current = {}; gainRef.current = {}
    setPlaying({})
  }, [])

  function startTimer(mins: number) {
    clearInterval(timerRef.current)
    setTimer(mins); setRemaining(mins * 60)
    timerRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(timerRef.current); stopAll(); return 0 }
        return r - 1
      })
    }, 1000)
  }

  useEffect(() => () => {
    clearInterval(timerRef.current)
    stopAll()
    ctxRef.current?.close()
  }, [stopAll])

  const anyPlaying = Object.values(playing).some(Boolean)

  return (
    <>
      <section className="bg-gradient-to-br from-[#0D3D3D] to-teal-deep py-16 px-[5%] text-white text-center">
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold mb-3">Calm Sounds 🎧</h1>
        <p className="text-white/70 text-[1.05rem] max-w-[500px] mx-auto">
          Layer ambient sounds into your perfect calm space. Mix volumes, set a timer, breathe.
        </p>
        <p className="text-white/40 text-[0.75rem] mt-2">All sounds generated in your browser · No downloads · Works offline</p>
      </section>

      <section className="py-12 px-[5%]">
        <div className="max-w-3xl mx-auto">

          {/* Sound grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {SOUNDS.map(s => (
              <div key={s.id} className={`bg-white rounded-[24px] border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lift
                ${playing[s.id] ? 'border-teal-mid shadow-lift' : 'border-teal-light shadow-card'}`}>
                <button
                  type="button"
                  onClick={() => toggleSound(s)}
                  aria-pressed={playing[s.id] ?? false}
                  aria-label={`${playing[s.id] ? 'Stop' : 'Play'} ${s.label}`}
                  className={`w-full pt-5 px-5 pb-3 flex flex-col items-center relative`}>
                  {playing[s.id] && (
                    <div className={`absolute inset-0 bg-gradient-to-b ${s.color} opacity-10 rounded-t-[24px]`} />
                  )}
                  <span className={`text-[2.5rem] block mb-2 transition-transform duration-300 ${playing[s.id] ? 'scale-110' : ''}`} aria-hidden="true">
                    {s.icon}
                  </span>
                  <p className={`text-[0.88rem] font-semibold mb-1 ${playing[s.id] ? 'text-teal-deep' : 'text-text-mid'}`}>{s.label}</p>
                  {playing[s.id] ? (
                    <span className="flex items-center gap-1 text-[0.68rem] font-bold text-teal-mid">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-mid animate-pulse" />PLAYING
                    </span>
                  ) : (
                    <span className="text-[0.68rem] font-semibold text-text-xlight tracking-wide">TAP TO PLAY</span>
                  )}
                </button>
                {playing[s.id] && (
                  <div className="px-4 pb-4">
                    <input
                      type="range" min={0} max={1} step={0.05}
                      value={volumes[s.id] ?? 0.6}
                      onChange={e => setVolume(s.id, parseFloat(e.target.value))}
                      aria-label={`${s.label} volume`}
                      className="w-full accent-teal-mid h-1.5" />
                    <div className="flex justify-between text-[0.6rem] text-text-xlight mt-0.5">
                      <span>🔉</span><span>🔊</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Active mix bar */}
          {anyPlaying && (
            <div className="bg-teal-deep text-white rounded-[20px] px-6 py-4 mb-6 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
                <span className="text-[0.88rem] font-semibold">
                  {Object.entries(playing).filter(([,v]) => v).map(([k]) => SOUNDS.find(s => s.id === k)?.icon).join(' ')} Playing
                </span>
              </div>
              <button onClick={stopAll} className="text-[0.78rem] font-semibold bg-white/15 hover:bg-white/25 px-4 py-2 rounded-full transition-colors">
                ⏹ Stop all
              </button>
            </div>
          )}

          {/* Timer */}
          {anyPlaying && (
            <div className="bg-teal-ghost rounded-[20px] p-5 mb-8">
              <p className="text-[0.82rem] font-semibold text-teal-deep mb-3">⏱ Session timer</p>
              <div className="flex gap-2.5 flex-wrap items-center">
                {[5, 10, 15, 30, 60].map(m => (
                  <button key={m} onClick={() => startTimer(m)}
                    className={`px-4 py-2 rounded-full border text-[0.83rem] font-medium transition-all
                      ${timer === m && remaining > 0 ? 'bg-teal-deep text-white border-teal-deep' : 'bg-white text-text-mid border-teal-light hover:border-teal-mid'}`}>
                    {m} min
                  </button>
                ))}
                {remaining > 0 && (
                  <span className="text-teal-deep font-bold text-[1rem]">
                    {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Breathing guide */}
          <div className="bg-white rounded-[24px] p-7 border border-teal-light shadow-card">
            <h2 className="font-display text-[1.2rem] text-charcoal mb-4">Breathing Guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BREATHING.map(b => (
                <button key={b.label} onClick={() => setBreath(breath?.label === b.label ? null : b)}
                  className={`rounded-[16px] p-5 border text-left transition-all
                    ${breath?.label === b.label ? 'bg-teal-deep text-white border-teal-deep shadow-md' : 'bg-teal-ghost border-teal-light hover:border-teal-mid'}`}>
                  <p className={`font-bold text-[0.95rem] mb-0.5 ${breath?.label === b.label ? 'text-white' : 'text-teal-deep'}`}>{b.label}</p>
                  <p className={`text-[0.78rem] ${breath?.label === b.label ? 'text-white/75' : 'text-text-light'}`}>{b.desc}</p>
                  <p className={`text-[0.72rem] mt-2 font-medium ${breath?.label === b.label ? 'text-amber-soft' : 'text-text-xlight'}`}>
                    In {b.inhale}s {b.hold > 0 ? `· Hold ${b.hold}s ` : ''}· Out {b.exhale}s
                  </p>
                </button>
              ))}
            </div>
            {breath && (
              <div className="mt-5 p-5 bg-teal-ghost rounded-[16px] text-center">
                <p className="text-teal-deep font-semibold text-[1rem]">
                  Inhale for <strong>{breath.inhale}s</strong>
                  {breath.hold > 0 && <> · Hold for <strong>{breath.hold}s</strong></>}
                  {' '}· Exhale for <strong>{breath.exhale}s</strong>
                </p>
                <p className="text-text-xlight text-[0.82rem] mt-1">Close your eyes and follow the rhythm. 🌿</p>
              </div>
            )}
          </div>

          <p className="text-center text-text-xlight text-[0.75rem] mt-6">
            🎵 Sounds synthesized live in your browser using Web Audio API · Uses headphones for best binaural experience
          </p>
        </div>
      </section>
    </>
  )
}
