'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// ── Web Audio synthesis — no MP3 files needed ─────────────────────────────────
// Each sound is generated procedurally so the page works out of the box
// with no external dependencies or copyright concerns.

// Timeout IDs from any event-based instrument are tracked here so they
// can be cancelled when the user stops the sound.
type TimeoutId = ReturnType<typeof setTimeout>

interface SoundDef {
  id: string; label: string; icon: string; color: string
  build: (ctx: AudioContext, dest: AudioNode, tids: TimeoutId[]) => AudioNode[]
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
    build(ctx, dest, _tids) {
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
    build(ctx, dest, _tids) {
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
    build(ctx, dest, _tids) {
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
    build(ctx, dest, _tids) {
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
    build(ctx, dest, _tids) {
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
    build(ctx, dest, _tids) {
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
    build(ctx, dest, _tids) {
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
    build(ctx, dest, _tids) {
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

  // ── Musical Instruments — all use CONTINUOUS DRONE synthesis ────────────────
  // Returns proper AudioNode[] so sounds can be stopped cleanly.
  // No more setTimeout-based note scheduling that runs forever.

  {
    id: 'piano', label: 'Soft Piano', icon: '🎹', color: 'from-gray-300 to-slate-500',
    build(ctx, dest, tids) {
      // Pentatonic scale: C4 D4 E4 G4 A4 C5 D5 E5 G5
      const PENTA = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3, 784.0]
      const reverb = ctx.createConvolver()
      // Simple reverb impulse
      const irLen = ctx.sampleRate * 2
      const irBuf = ctx.createBuffer(2, irLen, ctx.sampleRate)
      for (let c = 0; c < 2; c++) {
        const d = irBuf.getChannelData(c)
        for (let i = 0; i < irLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2)
      }
      reverb.buffer = irBuf
      const reverbGain = ctx.createGain(); reverbGain.gain.value = 0.35
      reverb.connect(reverbGain); reverbGain.connect(dest)

      function playNote() {
        const freq = PENTA[Math.floor(Math.random() * PENTA.length)]
        const t = ctx.currentTime
        // Piano tone = sine + triangle + slight 2nd harmonic
        const o1 = ctx.createOscillator(); o1.type = 'sine';     o1.frequency.value = freq
        const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = freq
        const o3 = ctx.createOscillator(); o3.type = 'sine';     o3.frequency.value = freq * 2
        const g = ctx.createGain()
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.18, t + 0.01)  // fast attack
        g.gain.exponentialRampToValueAtTime(0.06, t + 0.8)
        g.gain.exponentialRampToValueAtTime(0.001, t + 2.5)
        const g2 = ctx.createGain(); g2.gain.value = 0.4
        const g3 = ctx.createGain(); g3.gain.value = 0.08
        o1.connect(g); o2.connect(g2); g2.connect(g); o3.connect(g3); g3.connect(g)
        g.connect(dest); g.connect(reverb)
        o1.start(t); o2.start(t); o3.start(t)
        o1.stop(t + 3); o2.stop(t + 3); o3.stop(t + 3)
        setTimeout(playNote, 1800 + Math.random() * 3500)
      }
      playNote()
      return []
    },
  },

  {
    id: 'flute', label: 'Bamboo Flute', icon: '🪈', color: 'from-lime-400 to-teal-500',
    build(ctx, dest, _tids) {
      // Pentatonic minor: D4 F4 G4 A4 C5 D5 F5
      const SCALE = [293.7, 349.2, 392.0, 440.0, 523.3, 587.3, 698.5]
      function playPhrase() {
        const noteCount = 2 + Math.floor(Math.random() * 4)
        let delay = 0
        for (let i = 0; i < noteCount; i++) {
          const freq = SCALE[Math.floor(Math.random() * SCALE.length)]
          const dur  = 0.4 + Math.random() * 0.8
          const t    = ctx.currentTime + delay
          // Flute = sine + breathiness
          const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq
          const noise = makeNoise(ctx, 'white')
          const noiseF = ctx.createBiquadFilter(); noiseF.type = 'bandpass'; noiseF.frequency.value = freq * 2; noiseF.Q.value = 3
          const noiseG = ctx.createGain(); noiseG.gain.value = 0.04
          // Vibrato
          const vib = ctx.createOscillator(); vib.frequency.value = 5.5
          const vibG = ctx.createGain(); vibG.gain.value = freq * 0.012
          vib.connect(vibG); vibG.connect(o.frequency)
          const g = ctx.createGain()
          g.gain.setValueAtTime(0, t)
          g.gain.linearRampToValueAtTime(0.22, t + 0.08)
          g.gain.setValueAtTime(0.22, t + dur - 0.12)
          g.gain.linearRampToValueAtTime(0, t + dur)
          noise.connect(noiseF); noiseF.connect(noiseG); noiseG.connect(dest)
          o.connect(g); g.connect(dest)
          o.start(t); vib.start(t); noise.start()
          o.stop(t + dur + 0.1); vib.stop(t + dur + 0.1)
          setTimeout(() => { try { noise.stop() } catch {} }, (delay + dur + 0.2) * 1000)
          delay += dur + 0.1 + Math.random() * 0.3
        }
        setTimeout(playPhrase, (delay + 1.5 + Math.random() * 3) * 1000)
      }
      playPhrase()
      return []
    },
  },

  {
    id: 'panflute', label: 'Pan Flute', icon: '🎶', color: 'from-emerald-400 to-teal-600',
    build(ctx, dest, _tids) {
      // Pan flute — South American style, breathy lower register, each pipe a different pitch
      const PIPES = [196.0, 220.0, 246.9, 261.6, 293.7, 329.6, 349.2, 392.0] // G3–G4
      function playPipe() {
        const freq = PIPES[Math.floor(Math.random() * PIPES.length)]
        const dur  = 0.6 + Math.random() * 1.2
        const t    = ctx.currentTime
        // Pan flute = more noise/air than bamboo, wider vibrato, lower pitch
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq
        const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 1.5
        // Heavy breath (pan flute characteristic)
        const noise = makeNoise(ctx, 'white')
        const noiseF = ctx.createBiquadFilter(); noiseF.type = 'bandpass'
        noiseF.frequency.value = freq * 1.8; noiseF.Q.value = 2
        const noiseG = ctx.createGain(); noiseG.gain.value = 0.08
        // Wide, slow vibrato
        const vib = ctx.createOscillator(); vib.frequency.value = 4.2
        const vibG = ctx.createGain(); vibG.gain.value = freq * 0.022
        vib.connect(vibG); vibG.connect(o.frequency)
        const g = ctx.createGain(); const g2 = ctx.createGain(); g2.gain.value = 0.15
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.25, t + 0.12)
        g.gain.setValueAtTime(0.22, t + dur - 0.15)
        g.gain.linearRampToValueAtTime(0, t + dur)
        noise.connect(noiseF); noiseF.connect(noiseG); noiseG.connect(dest)
        o.connect(g); o2.connect(g2); g2.connect(g); g.connect(dest)
        o.start(t); o2.start(t); vib.start(t); noise.start()
        o.stop(t + dur + 0.1); o2.stop(t + dur + 0.1); vib.stop(t + dur + 0.1)
        setTimeout(() => { try { noise.stop() } catch {} }, (dur + 0.3) * 1000)
        setTimeout(playPipe, (dur + 0.3 + Math.random() * 1.5) * 1000)
      }
      playPipe()
      return []
    },
  },

  {
    id: 'nativeflute', label: 'Native Flute', icon: '🌾', color: 'from-orange-400 to-amber-700',
    build(ctx, dest, _tids) {
      // Native American flute — pentatonic minor, soulful, earthy, meditative
      // A minor pentatonic: A3 C4 D4 E4 G4 A4 C5
      const SCALE = [220.0, 261.6, 293.7, 329.6, 392.0, 440.0, 523.3]
      const reverb = ctx.createConvolver()
      const irBuf = ctx.createBuffer(2, ctx.sampleRate * 2, ctx.sampleRate)
      for (let c = 0; c < 2; c++) {
        const d = irBuf.getChannelData(c)
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.8) * 0.4
      }
      reverb.buffer = irBuf
      const rvG = ctx.createGain(); rvG.gain.value = 0.3; reverb.connect(rvG); rvG.connect(dest)

      function playMotive() {
        // Native flute often plays 2-3 note phrases with long sustains and silence
        const notes = [
          SCALE[Math.floor(Math.random() * 4)],
          SCALE[Math.floor(Math.random() * 4) + 2],
        ]
        let t = ctx.currentTime
        notes.forEach((freq, ni) => {
          const dur = 0.8 + Math.random() * 1.4
          const o  = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq
          const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2
          // Earthy growl via triangle
          const o3 = ctx.createOscillator(); o3.type = 'triangle'; o3.frequency.value = freq
          // Slow deep vibrato — characteristic of Native American flute
          const vib  = ctx.createOscillator(); vib.frequency.value = 3.8 + Math.random() * 1.2
          const vibG = ctx.createGain(); vibG.gain.value = freq * 0.018
          vib.connect(vibG); vibG.connect(o.frequency)
          // breath noise
          const noise = makeNoise(ctx, 'pink')
          const nF = ctx.createBiquadFilter(); nF.type = 'bandpass'; nF.frequency.value = freq; nF.Q.value = 4
          const nG = ctx.createGain(); nG.gain.value = 0.06
          const g = ctx.createGain(); const g2 = ctx.createGain(); g2.gain.value = 0.2
          const g3 = ctx.createGain(); g3.gain.value = 0.3
          g.gain.setValueAtTime(0, t)
          g.gain.linearRampToValueAtTime(0.2, t + 0.15)
          g.gain.setValueAtTime(0.18, t + dur - 0.2)
          g.gain.linearRampToValueAtTime(0, t + dur)
          o.connect(g); o2.connect(g2); g2.connect(g); o3.connect(g3); g3.connect(g)
          g.connect(dest); g.connect(reverb)
          noise.connect(nF); nF.connect(nG); nG.connect(dest)
          o.start(t); o2.start(t); o3.start(t); vib.start(t); noise.start()
          const stopT = t + dur + 0.1
          o.stop(stopT); o2.stop(stopT); o3.stop(stopT); vib.stop(stopT)
          setTimeout(() => { try { noise.stop() } catch {} }, (stopT - ctx.currentTime + 0.2) * 1000)
          t += dur + 0.05 + Math.random() * 0.2
        })
        setTimeout(playMotive, (t - ctx.currentTime + 2 + Math.random() * 4) * 1000)
      }
      playMotive()
      return []
    },
  },

  {
    id: 'shakuhachi', label: 'Shakuhachi', icon: '🎍', color: 'from-stone-400 to-slate-600',
    build(ctx, dest, _tids) {
      // Japanese Shakuhachi — deep, breathy, Zen meditative tones
      // D minor: D3 F3 G3 A3 C4 D4 — very slow, lots of silence
      const ZEN = [146.8, 174.6, 196.0, 220.0, 261.6, 293.7]
      const reverb = ctx.createConvolver()
      const irBuf = ctx.createBuffer(2, ctx.sampleRate * 3, ctx.sampleRate)
      for (let c = 0; c < 2; c++) {
        const d = irBuf.getChannelData(c)
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.2) * 0.6
      }
      reverb.buffer = irBuf
      const rvG = ctx.createGain(); rvG.gain.value = 0.5; reverb.connect(rvG); rvG.connect(dest)

      function zenNote() {
        const freq = ZEN[Math.floor(Math.random() * ZEN.length)]
        const dur  = 1.5 + Math.random() * 2.5  // long, held notes
        const t    = ctx.currentTime
        // Shakuhachi = very breathy, dark tone with strong attack noise
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq
        const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 1.5 // 3rd partial weak
        // Very strong initial breath burst
        const noise = makeNoise(ctx, 'white')
        const nF1 = ctx.createBiquadFilter(); nF1.type = 'bandpass'; nF1.frequency.value = freq * 0.9; nF1.Q.value = 1.5
        const nG = ctx.createGain()
        nG.gain.setValueAtTime(0.25, t)
        nG.gain.exponentialRampToValueAtTime(0.05, t + 0.3) // breath fades to tone
        nG.gain.exponentialRampToValueAtTime(0.03, t + dur)
        // Slow pitch bend (meri/kari technique)
        o.frequency.setValueAtTime(freq * 0.97, t)
        o.frequency.linearRampToValueAtTime(freq, t + 0.4)
        if (Math.random() > 0.5) {
          o.frequency.setValueAtTime(freq, t + dur * 0.7)
          o.frequency.linearRampToValueAtTime(freq * 0.94, t + dur)
        }
        const g = ctx.createGain(); const g2 = ctx.createGain(); g2.gain.value = 0.12
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.28, t + 0.08)
        g.gain.setValueAtTime(0.22, t + dur - 0.3)
        g.gain.exponentialRampToValueAtTime(0.001, t + dur)
        o.connect(g); o2.connect(g2); g2.connect(g)
        g.connect(dest); g.connect(reverb)
        noise.connect(nF1); nF1.connect(nG); nG.connect(dest); nG.connect(reverb)
        o.start(t); o2.start(t); noise.start()
        o.stop(t + dur + 0.2); o2.stop(t + dur + 0.2)
        setTimeout(() => { try { noise.stop() } catch {} }, (dur + 0.5) * 1000)
        // Long silence between notes — Zen minimalism
        setTimeout(zenNote, (dur + 3 + Math.random() * 6) * 1000)
      }
      zenNote()
      return []
    },
  },

  {
    id: 'irishflute', label: 'Irish Flute', icon: '☘️', color: 'from-green-400 to-emerald-600',
    build(ctx, dest, _tids) {
      // Irish / Celtic tin whistle — bright, lively, pentatonic jig patterns
      // D major pentatonic: D4 E4 F#4 A4 B4 D5 E5
      const CELTIC = [293.7, 329.6, 370.0, 440.0, 493.9, 587.3, 659.3, 740.0]
      function playPhrase() {
        // Celtic phrases are faster with more ornamentation
        const noteCount = 3 + Math.floor(Math.random() * 5)
        let delay = 0
        for (let i = 0; i < noteCount; i++) {
          const freq = CELTIC[Math.floor(Math.random() * CELTIC.length)]
          const dur  = 0.15 + Math.random() * 0.35  // shorter notes, brighter feel
          const t    = ctx.currentTime + delay
          const o  = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq
          const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = freq * 2
          const o3 = ctx.createOscillator(); o3.type = 'sine'; o3.frequency.value = freq * 3
          // Light, fast vibrato — Irish style
          const vib  = ctx.createOscillator(); vib.frequency.value = 7 + Math.random() * 2
          const vibG = ctx.createGain(); vibG.gain.value = freq * 0.008
          vib.connect(vibG); vibG.connect(o.frequency)
          const g = ctx.createGain(); const g2 = ctx.createGain(); g2.gain.value = 0.25
          const g3 = ctx.createGain(); g3.gain.value = 0.06
          g.gain.setValueAtTime(0, t)
          g.gain.linearRampToValueAtTime(0.22, t + 0.025)
          g.gain.setValueAtTime(0.20, t + dur - 0.04)
          g.gain.linearRampToValueAtTime(0, t + dur)
          // Occasional grace note ornament
          if (Math.random() > 0.6 && i < noteCount - 1) {
            const graceFreq = freq * 1.12
            o.frequency.setValueAtTime(graceFreq, t)
            o.frequency.setValueAtTime(freq, t + 0.04)
          }
          o.connect(g); o2.connect(g2); g2.connect(g); o3.connect(g3); g3.connect(g)
          g.connect(dest); o.start(t); o2.start(t); o3.start(t); vib.start(t)
          const s = t + dur + 0.05
          o.stop(s); o2.stop(s); o3.stop(s); vib.stop(s)
          delay += dur + 0.02 + Math.random() * 0.05
        }
        setTimeout(playPhrase, (delay + 0.8 + Math.random() * 2.5) * 1000)
      }
      playPhrase()
      return []
    },
  },

  {
    id: 'harp', label: 'Harp', icon: '🎵', color: 'from-yellow-300 to-amber-500',
    build(ctx, dest, _tids) {
      // Harp arpeggios in C major pentatonic: C3 E3 G3 C4 E4 G4 C5
      const STRINGS = [130.8, 164.8, 196.0, 261.6, 329.6, 392.0, 523.3, 659.3]
      const reverb = ctx.createConvolver()
      const irLen = ctx.sampleRate * 3
      const irBuf = ctx.createBuffer(2, irLen, ctx.sampleRate)
      for (let c = 0; c < 2; c++) {
        const d = irBuf.getChannelData(c)
        for (let i = 0; i < irLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 1.5) * 0.5
      }
      reverb.buffer = irBuf
      const rvG = ctx.createGain(); rvG.gain.value = 0.4; reverb.connect(rvG); rvG.connect(dest)

      function pluckArpeggio() {
        const chord = STRINGS.slice(Math.floor(Math.random() * 3), Math.floor(Math.random() * 3) + 4)
        chord.forEach((freq, i) => {
          const t = ctx.currentTime + i * 0.12
          // Plucked string = sine + harmonics with fast decay
          const o1 = ctx.createOscillator(); o1.type = 'sine';     o1.frequency.value = freq
          const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = freq * 2
          const o3 = ctx.createOscillator(); o3.type = 'sine';     o3.frequency.value = freq * 3
          const g = ctx.createGain()
          g.gain.setValueAtTime(0.18, t)
          g.gain.exponentialRampToValueAtTime(0.001, t + 4.0)
          const g2 = ctx.createGain(); g2.gain.value = 0.3
          const g3 = ctx.createGain(); g3.gain.value = 0.1
          o1.connect(g); o2.connect(g2); g2.connect(g); o3.connect(g3); g3.connect(g)
          g.connect(dest); g.connect(reverb)
          o1.start(t); o2.start(t); o3.start(t)
          o1.stop(t + 4.5); o2.stop(t + 4.5); o3.stop(t + 4.5)
        })
        setTimeout(pluckArpeggio, 4000 + Math.random() * 4000)
      }
      pluckArpeggio()
      return []
    },
  },

  {
    id: 'hangdrum', label: 'Hang Drum', icon: '🥁', color: 'from-rose-400 to-orange-500',
    build(ctx, dest, _tids) {
      // Authentic hang drum frequencies: D3, A3, Bb3, C4, D4, E4, F4, G4, A4
      const HANG = [146.8, 220.0, 233.1, 261.6, 293.7, 329.6, 349.2, 392.0, 440.0]
      const reverb = ctx.createConvolver()
      const irLen = ctx.sampleRate * 2.5
      const irBuf = ctx.createBuffer(2, irLen, ctx.sampleRate)
      for (let c = 0; c < 2; c++) {
        const d = irBuf.getChannelData(c)
        for (let i = 0; i < irLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 3) * 0.7
      }
      reverb.buffer = irBuf
      const rvG = ctx.createGain(); rvG.gain.value = 0.5; reverb.connect(rvG); rvG.connect(dest)

      function strike() {
        const freq = HANG[Math.floor(Math.random() * HANG.length)]
        const t    = ctx.currentTime
        // Hang drum = metallic bell-like tone
        const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = freq
        const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2.76 // inharmonic partial
        const o3 = ctx.createOscillator(); o3.type = 'sine'; o3.frequency.value = freq * 5.40
        const g = ctx.createGain()
        g.gain.setValueAtTime(0.22, t)
        g.gain.exponentialRampToValueAtTime(0.001, t + 3.5)
        const g2 = ctx.createGain(); g2.gain.value = 0.25
        const g3 = ctx.createGain(); g3.gain.value = 0.05
        o1.connect(g); o2.connect(g2); g2.connect(g); o3.connect(g3); g3.connect(g)
        g.connect(dest); g.connect(reverb)
        o1.start(t); o2.start(t); o3.start(t)
        o1.stop(t + 4); o2.stop(t + 4); o3.stop(t + 4)
        // Sometimes double-strike for rhythm
        if (Math.random() > 0.6) setTimeout(strike, 600 + Math.random() * 400)
        setTimeout(strike, 1500 + Math.random() * 3000)
      }
      strike()
      return []
    },
  },

  {
    id: 'cello', label: 'Cello Drone', icon: '🎻', color: 'from-amber-700 to-red-800',
    build(ctx, dest, _tids) {
      // Warm cello drone on C2 with harmonics — meditative, grounding
      const root = 65.4  // C2
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'; filter.frequency.value = 800

      // Bow pressure modulation — sawtooth filtered to sound like a bowed string
      const harmonics = [1, 2, 3, 4, 5, 6, 7]
      const oscs: OscillatorNode[] = []
      harmonics.forEach((h, i) => {
        const o = ctx.createOscillator(); o.type = 'sawtooth'
        o.frequency.value = root * h
        const g = ctx.createGain(); g.gain.value = 0.12 / (h * 1.2)
        // Slow vibrato
        const vib = ctx.createOscillator(); vib.frequency.value = 0.3 + Math.random() * 0.3
        const vibG = ctx.createGain(); vibG.gain.value = root * h * 0.003
        vib.connect(vibG); vibG.connect(o.frequency)
        o.connect(g); g.connect(filter); vib.start(); o.start()
        oscs.push(o, vib)
      })
      const masterG = ctx.createGain(); masterG.gain.value = 0.5
      filter.connect(masterG); masterG.connect(dest)
      // Slow swell
      const swell = lfo(ctx, 0.04, 0.3, 0.7)
      swell.gain.connect(masterG.gain)
      masterG.gain.value = swell.offset
      oscs.push(swell.osc)
      return oscs
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
  const nodesRef   = useRef<Record<string, AudioNode[]>>({})
  const gainRef    = useRef<Record<string, GainNode>>({})
  const timeoutsRef = useRef<Record<string, TimeoutId[]>>({})  // track all scheduled callbacks
  const timerRef   = useRef<ReturnType<typeof setInterval>>()

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
      // Cancel all scheduled note callbacks first — prevents "ghost" sounds
      ;(timeoutsRef.current[s.id] ?? []).forEach(id => clearTimeout(id))
      delete timeoutsRef.current[s.id]
      // Stop and disconnect all audio nodes
      nodesRef.current[s.id]?.forEach(n => {
        try { (n as OscillatorNode | AudioBufferSourceNode).stop?.() } catch {}
        try { n.disconnect() } catch {}
      })
      delete nodesRef.current[s.id]
      gainRef.current[s.id]?.disconnect()
      delete gainRef.current[s.id]
      setPlaying(p => ({ ...p, [s.id]: false }))
    } else {
      // Start — pass a timeout-tracking array to the build function
      const { ctx, master } = getCtx()
      const gain = ctx.createGain()
      gain.gain.value = volumes[s.id] ?? 0.6
      gain.connect(master)
      gainRef.current[s.id] = gain
      const tids: TimeoutId[] = []
      timeoutsRef.current[s.id] = tids
      const nodes = s.build(ctx, gain, tids)
      nodesRef.current[s.id] = nodes
      setPlaying(p => ({ ...p, [s.id]: true }))
    }
  }

  function setVolume(id: string, v: number) {
    setVolumes(p => ({ ...p, [id]: v }))
    if (gainRef.current[id]) gainRef.current[id].gain.value = v
  }

  const stopAll = useCallback(() => {
    // Cancel all scheduled callbacks
    Object.values(timeoutsRef.current).flat().forEach(id => clearTimeout(id))
    timeoutsRef.current = {}
    // Stop and disconnect all nodes
    Object.keys(nodesRef.current).forEach(id => {
      nodesRef.current[id]?.forEach(n => {
        try { (n as OscillatorNode | AudioBufferSourceNode).stop?.() } catch {}
        try { n.disconnect() } catch {}
      })
      gainRef.current[id]?.disconnect()
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

          {/* Nature sounds */}
          <div className="mb-2">
            <p className="text-[0.72rem] font-bold text-text-xlight uppercase tracking-widest mb-3">🌿 Nature & Ambience</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {SOUNDS.filter(s => !['piano','flute','panflute','nativeflute','shakuhachi','irishflute','harp','hangdrum','cello'].includes(s.id)).map(s => (
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
          </div>{/* end nature section */}

          {/* Instruments section */}
          <div className="mt-8 mb-6">
            <p className="text-[0.72rem] font-bold text-text-xlight uppercase tracking-widest mb-3">🎵 Musical Instruments</p>

            {/* Flutes subsection */}
            <p className="text-[0.65rem] text-text-xlight font-semibold uppercase tracking-widest mb-2 mt-1">🪈 Flutes</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
              {SOUNDS.filter(s => ['flute','panflute','nativeflute','shakuhachi','irishflute'].includes(s.id)).map(s => (
                <div key={s.id} className={`bg-white rounded-[20px] border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lift
                  ${playing[s.id] ? 'border-teal-mid shadow-lift' : 'border-teal-light shadow-card'}`}>
                  <button type="button" onClick={() => toggleSound(s)} aria-pressed={playing[s.id] ?? false}
                    className="w-full pt-4 px-4 pb-2.5 flex flex-col items-center relative">
                    {playing[s.id] && <div className={`absolute inset-0 bg-gradient-to-b ${s.color} opacity-10`} />}
                    <span className={`text-[2rem] block mb-1.5 transition-transform duration-300 ${playing[s.id] ? 'scale-110' : ''}`}>{s.icon}</span>
                    <p className={`text-[0.78rem] font-semibold text-center leading-tight mb-1 ${playing[s.id] ? 'text-teal-deep' : 'text-text-mid'}`}>{s.label}</p>
                    {playing[s.id]
                      ? <span className="flex items-center gap-1 text-[0.62rem] font-bold text-teal-mid"><span className="w-1.5 h-1.5 rounded-full bg-teal-mid animate-pulse" />ON</span>
                      : <span className="text-[0.62rem] text-text-xlight">▶ Play</span>}
                  </button>
                  {playing[s.id] && (
                    <div className="px-3 pb-3">
                      <input type="range" min={0} max={1} step={0.05} value={volumes[s.id] ?? 0.6}
                        onChange={e => setVolume(s.id, parseFloat(e.target.value))}
                        className="w-full accent-teal-mid h-1.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Other instruments subsection */}
            <p className="text-[0.65rem] text-text-xlight font-semibold uppercase tracking-widest mb-2">🎹 Other Instruments</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SOUNDS.filter(s => ['piano','harp','hangdrum','cello'].includes(s.id)).map(s => (
                <div key={s.id} className={`bg-white rounded-[24px] border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lift
                  ${playing[s.id] ? 'border-teal-mid shadow-lift' : 'border-teal-light shadow-card'}`}>
                  <button
                    type="button"
                    onClick={() => toggleSound(s)}
                    aria-pressed={playing[s.id] ?? false}
                    aria-label={`${playing[s.id] ? 'Stop' : 'Play'} ${s.label}`}
                    className="w-full pt-5 px-5 pb-3 flex flex-col items-center relative">
                    {playing[s.id] && (
                      <div className={`absolute inset-0 bg-gradient-to-b ${s.color} opacity-10 rounded-t-[24px]`} />
                    )}
                    <span className={`text-[2.5rem] block mb-2 transition-transform duration-300 ${playing[s.id] ? 'scale-110' : ''}`}>
                      {s.icon}
                    </span>
                    <p className={`text-[0.85rem] font-semibold mb-1 text-center ${playing[s.id] ? 'text-teal-deep' : 'text-text-mid'}`}>{s.label}</p>
                    {playing[s.id] ? (
                      <span className="flex items-center gap-1 text-[0.65rem] font-bold text-teal-mid">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-mid animate-pulse" />PLAYING
                      </span>
                    ) : (
                      <span className="text-[0.65rem] font-semibold text-text-xlight">TAP TO PLAY</span>
                    )}
                  </button>
                  {playing[s.id] && (
                    <div className="px-4 pb-4">
                      <input type="range" min={0} max={1} step={0.05}
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
