'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const GOAL = 8
const GLASS_ML = 250

const TIPS = [
  'Drink a glass of water as soon as you wake up — it jump-starts metabolism.',
  'Keep a water bottle on your desk. Visibility = more sips.',
  'Add cucumber, lemon or mint to make water more enjoyable.',
  'Thirst is already dehydration. Drink before you feel thirsty.',
  'Herbal tea counts toward your daily intake.',
  'Eat water-rich foods: cucumber, watermelon, strawberries, lettuce.',
]

function getKey() {
  return `ltp-water-${new Date().toISOString().slice(0, 10)}`
}

export default function WaterTrackerPage() {
  const [glasses,  setGlasses]  = useState(0)
  const [goal,     setGoal]     = useState(GOAL)
  const [animate,  setAnimate]  = useState(false)
  const [mounted,  setMounted]  = useState(false)
  const [tipIdx,   setTipIdx]   = useState(0)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(getKey())
    if (saved) setGlasses(Number(saved))
    const savedGoal = localStorage.getItem('ltp-water-goal')
    if (savedGoal) setGoal(Number(savedGoal))
    setTipIdx(Math.floor(Math.random() * TIPS.length))
  }, [])

  function add() {
    if (glasses >= goal + 4) return
    const next = glasses + 1
    setGlasses(next)
    localStorage.setItem(getKey(), String(next))
    setAnimate(true)
    setTimeout(() => setAnimate(false), 400)
  }

  function remove() {
    if (glasses <= 0) return
    const next = glasses - 1
    setGlasses(next)
    localStorage.setItem(getKey(), String(next))
  }

  function changeGoal(n: number) {
    setGoal(n)
    localStorage.setItem('ltp-water-goal', String(n))
  }

  const pct       = Math.min((glasses / goal) * 100, 100)
  const mlDrank   = glasses * GLASS_ML
  const mlGoal    = goal * GLASS_ML
  const done      = glasses >= goal
  const overGoal  = glasses > goal

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1e3d] to-[#061228] pt-[72px] flex flex-col">

      {/* Header */}
      <div className="px-[5%] pt-12 pb-6 text-center max-w-lg mx-auto w-full">
        <p className="text-blue-300 text-[0.75rem] font-semibold tracking-[0.2em] uppercase mb-3">Daily Water Tracker</p>
        <h1 className="font-display text-[2rem] font-bold text-white mb-2">Hydrate your mind. 💧</h1>
        <p className="text-white/50 text-[0.88rem]">Your brain is 75% water. Stay hydrated, stay sharp.</p>
      </div>

      <div className="flex-1 flex flex-col items-center px-[5%] pb-10 max-w-lg mx-auto w-full">

        {/* Big water glass visual */}
        <div className="relative mb-8" style={{ width: 180, height: 240 }}>
          {/* Glass outline */}
          <svg width="180" height="240" viewBox="0 0 180 240" className="absolute inset-0">
            <path d="M25 20 L10 220 Q10 230 25 230 L155 230 Q170 230 170 220 L155 20 Z"
              fill="none" stroke="rgba(147,197,253,0.3)" strokeWidth="3" />
            {/* Water fill */}
            <clipPath id="glass-clip">
              <path d="M25 20 L10 220 Q10 230 25 230 L155 230 Q170 230 170 220 L155 20 Z" />
            </clipPath>
            <g clipPath="url(#glass-clip)">
              <rect x="0" y={240 - (pct / 100) * 220} width="180" height="220"
                fill="url(#water-grad)" style={{ transition: 'y 0.6s ease' }} />
              {/* Wave effect */}
              <path d={`M0 ${240 - (pct / 100) * 220} Q45 ${240 - (pct / 100) * 220 - 8} 90 ${240 - (pct / 100) * 220} Q135 ${240 - (pct / 100) * 220 + 8} 180 ${240 - (pct / 100) * 220} V240 H0 Z`}
                fill="url(#water-grad)" style={{ transition: 'all 0.6s ease' }} />
            </g>
            <defs>
              <linearGradient id="water-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#60a5fa" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.95" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-white font-display font-bold text-[2.5rem] leading-none transition-transform ${animate ? 'scale-125' : 'scale-100'}`}>
              {glasses}
            </span>
            <span className="text-white/60 text-[0.75rem] mt-1">of {goal} glasses</span>
            <span className="text-blue-200/70 text-[0.7rem]">{mlDrank}ml / {mlGoal}ml</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full mb-6">
          <div className="flex justify-between text-[0.72rem] text-white/50 mb-1.5">
            <span>{pct.toFixed(0)}% of daily goal</span>
            <span>{done ? (overGoal ? `🎉 +${glasses - goal} bonus!` : '🎉 Goal reached!') : `${goal - glasses} more to go`}</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-600 bg-gradient-to-r from-blue-400 to-blue-600"
              style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={remove} disabled={glasses <= 0}
            className="w-14 h-14 rounded-full bg-white/10 border border-white/20 text-white text-[1.5rem] flex items-center justify-center hover:bg-white/20 disabled:opacity-30 transition-all active:scale-90">
            −
          </button>
          <button onClick={add}
            className="w-20 h-20 rounded-full bg-blue-500 hover:bg-blue-400 text-white text-[2.5rem] flex items-center justify-center shadow-lg shadow-blue-500/30 hover:-translate-y-1 transition-all active:scale-95">
            💧
          </button>
          <button onClick={remove} disabled={glasses <= 0}
            className="w-14 h-14 rounded-full bg-white/10 border border-white/20 text-white text-[0.75rem] font-semibold flex items-center justify-center hover:bg-white/20 disabled:opacity-30 transition-all">
            Undo
          </button>
        </div>

        {/* Glass grid */}
        <div className="grid grid-cols-8 gap-2 mb-8 w-full max-w-[320px]">
          {Array.from({ length: Math.max(goal, glasses) }).map((_, i) => (
            <button key={i} onClick={() => { setGlasses(i + 1); localStorage.setItem(getKey(), String(i + 1)) }}
              className={`aspect-square rounded-[8px] text-[1rem] transition-all hover:scale-110
                ${i < glasses
                  ? i >= goal ? 'bg-blue-300/30 text-blue-200' : 'bg-blue-500/70 text-white'
                  : 'bg-white/8 text-white/20'}`}>
              💧
            </button>
          ))}
        </div>

        {/* Goal selector */}
        <div className="bg-white/8 border border-white/12 rounded-[20px] p-5 w-full mb-5">
          <p className="text-white/60 text-[0.78rem] font-semibold mb-3">Daily Goal</p>
          <div className="flex gap-2 flex-wrap">
            {[6, 7, 8, 9, 10, 12].map(n => (
              <button key={n} onClick={() => changeGoal(n)}
                className={`px-4 py-1.5 rounded-full text-[0.82rem] font-semibold border transition-all
                  ${goal === n ? 'bg-blue-500 border-blue-400 text-white' : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white/70'}`}>
                {n} glasses
              </button>
            ))}
          </div>
          <p className="text-white/30 text-[0.7rem] mt-2">= {goal * GLASS_ML}ml per day</p>
        </div>

        {/* Today's tip */}
        <div className="bg-blue-500/10 border border-blue-400/20 rounded-[16px] p-4 w-full mb-6">
          <p className="text-blue-300 text-[0.72rem] font-bold uppercase tracking-widest mb-1.5">💡 Hydration Tip</p>
          <p className="text-white/70 text-[0.83rem] leading-[1.65]">{TIPS[tipIdx]}</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {[
            { icon: '🧠', label: 'Sharper focus',        desc: 'Even 2% dehydration impairs cognition' },
            { icon: '💪', label: 'More energy',           desc: 'Water is essential for ATP production' },
            { icon: '😊', label: 'Better mood',           desc: 'Dehydration causes irritability and fatigue' },
            { icon: '✨', label: 'Clearer skin',          desc: 'Hydration flushes toxins and plumps skin' },
          ].map(b => (
            <div key={b.label} className="bg-white/5 border border-white/10 rounded-[14px] p-3.5">
              <span className="text-[1.3rem] block mb-1">{b.icon}</span>
              <p className="text-white/80 text-[0.8rem] font-semibold leading-none mb-1">{b.label}</p>
              <p className="text-white/35 text-[0.68rem]">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-4 text-[0.78rem]">
          <Link href="/mood"     className="text-blue-300/60 hover:text-blue-300 no-underline transition-colors">Log Mood →</Link>
          <Link href="/sleep"    className="text-blue-300/60 hover:text-blue-300 no-underline transition-colors">Sleep Tracker →</Link>
          <Link href="/habits"   className="text-blue-300/60 hover:text-blue-300 no-underline transition-colors">Habits →</Link>
        </div>
      </div>
    </div>
  )
}
