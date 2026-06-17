'use client'

import { useState } from 'react'
import Link from 'next/link'

const CATEGORIES = [
  { key: 'all',       label: 'All Tools',  emoji: '✨' },
  { key: 'reflect',   label: 'Reflect',    emoji: '🪞' },
  { key: 'calm',      label: 'Calm',       emoji: '🧘' },
  { key: 'grow',      label: 'Grow',       emoji: '💪' },
  { key: 'create',    label: 'Create',     emoji: '🎨' },
  { key: 'wellbeing', label: 'Wellbeing',  emoji: '🌿' },
]

const TOOLS = [
  // Reflect
  { href: '/journal',    icon: '📓', label: 'Gratitude Journal',   desc: 'Daily reflection on life\'s simple joys. Write what you\'re grateful for.',       cat: 'reflect',   featured: false, color: 'bg-teal-ghost border-teal-light' },
  { href: '/mood',       icon: '📊', label: 'Mood Tracker',        desc: 'Identify patterns in your emotional landscape over time.',                          cat: 'reflect',   featured: false, color: 'bg-blue-50 border-blue-200' },
  { href: '/sleep',      icon: '🌙', label: 'Sleep Tracker',       desc: 'Track sleep quality and duration. Build better rest habits.',                       cat: 'reflect',   featured: false, color: 'bg-indigo-50 border-indigo-200' },
  { href: '/water',      icon: '💧', label: 'Water Tracker',       desc: 'Stay hydrated. Track your daily water intake against your goal.',                   cat: 'reflect',   featured: false, color: 'bg-sky-50 border-sky-200' },
  { href: '/snapshot',   icon: '📈', label: 'Wellness Snapshot',   desc: 'See your 7-day wellbeing summary — mood, sleep, habits in one view.',               cat: 'reflect',   featured: false, color: 'bg-teal-ghost border-teal-light' },
  { href: '/intention',  icon: '🌅', label: 'Morning Intention',   desc: 'Set a single word intention every morning to anchor your day with purpose.',        cat: 'reflect',   featured: false, color: 'bg-amber/10 border-amber/30' },
  { href: '/calendar',   icon: '📅', label: 'Wellness Calendar',   desc: 'Your entire wellness journey mapped on a calendar, day by day.',                    cat: 'reflect',   featured: false, color: 'bg-teal-ghost border-teal-light' },

  // Calm
  { href: '/coach',      icon: '🌿', label: 'Calm Coach AI',       desc: 'Your 24/7 empathetic AI companion for grounding and emotional support.',            cat: 'calm',      featured: true,  color: 'bg-teal-ghost border-teal-mid' },
  { href: '/meditation', icon: '🧘', label: 'Guided Meditation',   desc: 'Journey through curated audio landscapes designed for mental clarity.',             cat: 'calm',      featured: false, color: 'bg-purple-50 border-purple-200' },
  { href: '/sounds',     icon: '🎧', label: 'Calm Sounds',         desc: 'Mix ambient sounds — rain, forest, ocean — to create your perfect focus state.',    cat: 'calm',      featured: false, color: 'bg-teal-ghost border-teal-light' },
  { href: '/breathing',  icon: '🌬️', label: 'Breathing Exercises', desc: 'Voice-guided breathwork. Box breathing, 4-7-8, and more — in under 5 minutes.',   cat: 'calm',      featured: false, color: 'bg-sky-50 border-sky-200' },
  { href: '/reframe',    icon: '🧠', label: 'Thought Reframer',    desc: 'CBT-based tool to challenge negative thoughts and find new perspectives.',          cat: 'calm',      featured: false, color: 'bg-purple-50 border-purple-200' },

  // Grow
  { href: '/challenges',    icon: '🏆', label: '30-Day Challenges',   desc: 'Build sustainable habits for a growth mindset — one day at a time.',             cat: 'grow',      featured: true,  color: 'bg-amber/10 border-amber/30' },
  { href: '/habits',        icon: '🎯', label: 'Habit Tracker',       desc: 'Build daily habits with streak tracking, reminders, and completion history.',    cat: 'grow',      featured: false, color: 'bg-orange-50 border-orange-200' },
  { href: '/habits-lab',    icon: '⚡', label: 'Habits Lab',          desc: 'Learn the science of habit formation, stacking, and the 4 laws of change.',      cat: 'grow',      featured: false, color: 'bg-teal-ghost border-teal-light' },
  { href: '/yoga',          icon: '🧘‍♀️', label: 'Yoga Guide',         desc: '6 yoga styles with step-by-step instructions and medical benefits.',             cat: 'grow',      featured: false, color: 'bg-green-50 border-green-200' },
  { href: '/wisdom-coaching',icon: '👴',label: 'Wisdom Coaching',     desc: 'Stoic principles, Ikigai frameworks, and daily wisdom practices.',               cat: 'grow',      featured: false, color: 'bg-purple-50 border-purple-200' },
  { href: '/quiz',          icon: '🎯', label: 'Wellness Quiz',       desc: 'Take our 6-question assessment and get a personalised wellness plan.',            cat: 'grow',      featured: false, color: 'bg-amber/10 border-amber/30' },

  // Create
  { href: '/affirmation', icon: '💌', label: 'Daily Affirmation',   desc: 'Generate a personalised affirmation card and download or share it.',              cat: 'create',    featured: false, color: 'bg-pink-50 border-pink-200' },
  { href: '/quotes',      icon: '🎨', label: 'Quote Creator',       desc: 'Design a beautiful quote card with photo backgrounds. Share to social media.',    cat: 'create',    featured: true,  color: 'bg-amber/10 border-amber/30' },
  { href: '/birthday-card',icon: '🎂', label: 'Birthday Card Maker', desc: 'AI writes a warm, funny, or poetic birthday message. Pick a design, download & share.', cat: 'create', featured: true,  color: 'bg-pink-50 border-pink-200' },
  { href: '/vision-board',icon: '⭐', label: 'Vision Board',        desc: 'Visualise your goals and future through creative digital collaging.',              cat: 'create',    featured: false, color: 'bg-amber/10 border-amber/30' },
  { href: '/drawing',     icon: '✏️', label: 'Positive Drawing',    desc: 'Zentangle, mandala and mindful drawing — creative calm in your browser.',        cat: 'create',    featured: false, color: 'bg-pink-50 border-pink-200' },

  // Wellbeing
  { href: '/positive-eating', icon: '🥗', label: 'Positive Eating',    desc: 'Discover how food affects your mind and mood. Science-backed nutrition.',      cat: 'wellbeing', featured: false, color: 'bg-green-50 border-green-200' },
  { href: '/happy-foods',     icon: '😊', label: 'Foods for Happiness', desc: '12 proven happiness-boosting foods with recipes and the science behind them.', cat: 'wellbeing', featured: false, color: 'bg-amber/10 border-amber/30' },
  { href: '/kids',            icon: '🌈', label: 'Kids Zone',           desc: 'Fun, age-appropriate wellness activities for younger members.',                cat: 'wellbeing', featured: false, color: 'bg-pink-50 border-pink-200' },
]

export default function ToolsDirectoryPage() {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('all')

  const filtered = TOOLS.filter(t => {
    const matchCat  = category === 'all' || t.cat === category
    const matchSearch = !search.trim() || t.label.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const featured = filtered.filter(t => t.featured)
  const regular  = filtered.filter(t => !t.featured)

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost/50 to-ivory pt-[72px]">

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-deep to-teal-dark px-[5%] pt-12 pb-10 text-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-3">🛠️ All Wellness Tools</p>
          <h1 className="font-display text-[2.2rem] sm:text-[2.8rem] font-bold leading-snug mb-2">
            Find your <em className="italic text-amber-soft">sanctuary tool.</em>
          </h1>
          <p className="text-white/65 text-[0.97rem] mb-7 max-w-[500px]">
            {TOOLS.length} tools built for your mind, body, and soul — all in one place.
          </p>

          {/* Search */}
          <div className="relative max-w-lg">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/40 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tools…"
              className="w-full bg-white/12 border border-white/20 rounded-full pl-11 pr-5 py-3 text-white placeholder-white/45 text-[0.95rem] outline-none focus:border-white/50 focus:bg-white/15 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors text-[1.2rem] leading-none">×</button>
            )}
          </div>
        </div>
      </div>

      {/* Category chips */}
      <div className="sticky top-[72px] z-30 bg-white border-b border-teal-light overflow-x-auto">
        <div className="max-w-4xl mx-auto px-[5%]">
          <div className="flex gap-2 py-3 min-w-max">
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setCategory(c.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[0.82rem] font-semibold transition-all whitespace-nowrap
                  ${category === c.key
                    ? 'bg-teal-deep text-white shadow-sm'
                    : 'bg-teal-ghost text-text-mid hover:bg-teal-light/40 hover:text-teal-deep'}`}>
                <span>{c.emoji}</span> {c.label}
                <span className={`text-[0.65rem] ml-0.5 ${category === c.key ? 'opacity-70' : 'text-text-xlight'}`}>
                  {c.key === 'all' ? TOOLS.length : TOOLS.filter(t => t.cat === c.key).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-[5%] py-8 space-y-8">

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-[3rem] block mb-3">🔍</span>
            <p className="font-semibold text-charcoal text-[1.1rem] mb-2">No tools found</p>
            <p className="text-text-mid text-[0.9rem] mb-4">Try a different search term or category</p>
            <button onClick={() => { setSearch(''); setCategory('all') }}
              className="bg-teal-deep text-white px-6 py-2.5 rounded-full font-semibold text-[0.88rem] hover:bg-teal-dark transition-colors">
              Show all tools
            </button>
          </div>
        ) : (
          <>
            {/* Featured tools */}
            {featured.length > 0 && (
              <section>
                <p className="text-[0.72rem] font-bold text-text-xlight uppercase tracking-widest mb-4">⭐ Featured</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featured.map(t => (
                    <Link key={t.href} href={t.href}
                      className={`${t.color} border-2 rounded-[22px] p-6 no-underline hover:-translate-y-1 hover:shadow-lift transition-all group`}>
                      <span className="text-[2.4rem] block mb-3">{t.icon}</span>
                      <span className={`text-[0.65rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2 inline-block ${t.cat === 'calm' ? 'bg-teal-mid/20 text-teal-deep' : t.cat === 'grow' ? 'bg-amber/20 text-amber' : t.cat === 'create' ? 'bg-pink-200 text-pink-700' : 'bg-teal-ghost text-teal-deep'}`}>
                        {CATEGORIES.find(c => c.key === t.cat)?.emoji} {t.cat}
                      </span>
                      <h3 className="font-display font-bold text-charcoal text-[1.1rem] mb-1 group-hover:text-teal-deep transition-colors">{t.label}</h3>
                      <p className="text-text-mid text-[0.83rem] leading-[1.65] mb-3">{t.desc}</p>
                      <span className="text-teal-mid text-[0.82rem] font-semibold group-hover:text-teal-deep transition-colors">Open tool →</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* All tools */}
            {regular.length > 0 && (
              <section>
                {featured.length > 0 && <p className="text-[0.72rem] font-bold text-text-xlight uppercase tracking-widest mb-4">All {category === 'all' ? '' : CATEGORIES.find(c=>c.key===category)?.label + ' '}Tools</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regular.map(t => (
                    <Link key={t.href} href={t.href}
                      className="bg-white border border-teal-light rounded-[18px] p-5 no-underline hover:border-teal-mid hover:-translate-y-0.5 hover:shadow-card transition-all group flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-[14px] ${t.color} flex items-center justify-center text-[1.6rem] flex-shrink-0 border`}>
                        {t.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-charcoal text-[0.93rem] mb-0.5 group-hover:text-teal-deep transition-colors">{t.label}</p>
                        <p className="text-text-xlight text-[0.78rem] leading-snug">{t.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
