'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

const ALL_FEED_ITEMS = [
  {
    id: 1, type: 'Quote', mood: 'Positive',
    title: '"The best time to plant a tree was 20 years ago. The second best time is now."',
    body: 'Every moment of delay is also a moment of possibility. Start now — not because it\'s easy, but because now is the only time that exists.',
    author: 'Chinese Proverb', likes: 35, saves: 12, icon: '💬', featured: true,
  },
  {
    id: 2, type: 'Affirmation', mood: 'Calm',
    title: 'I am allowed to take up space.',
    body: 'Your presence is not an inconvenience. Your thoughts are not a burden. You belong here — fully, unapologetically.',
    author: 'Daily Affirmation', likes: 48, saves: 22, icon: '⭐', featured: false,
  },
  {
    id: 3, type: 'Story', mood: 'Gratitude',
    title: 'The Day I Stopped Waiting to Feel Ready',
    body: 'For years I waited to feel confident before I started. Then someone told me: "Courage isn\'t the absence of fear — it\'s moving forward despite it." I took one small step. Then another.',
    author: 'Tapas Pattanaik', likes: 62, saves: 31, icon: '📖', featured: false,
  },
  {
    id: 4, type: 'Quote', mood: 'Positive',
    title: '"You don\'t have to be great to start, but you have to start to be great."',
    body: 'Zig Ziglar understood what most of us forget: the beginning is the hardest and the most important part.',
    author: 'Zig Ziglar', likes: 29, saves: 15, icon: '💬', featured: false,
  },
  {
    id: 5, type: 'Affirmation', mood: 'Positive',
    title: 'I don\'t have to be perfect. I just have to keep going.',
    body: 'Progress isn\'t a straight line. Some days you move forward, some days you rest. Both are part of the journey.',
    author: 'Daily Affirmation', likes: 55, saves: 28, icon: '⭐', featured: false,
  },
  {
    id: 6, type: 'Quote', mood: 'Calm',
    title: '"In the middle of every difficulty lies opportunity."',
    body: 'This is not wishful thinking — it\'s observation. The most growth you will ever experience will come from the hardest seasons.',
    author: 'Albert Einstein', likes: 41, saves: 19, icon: '💬', featured: false,
  },
  {
    id: 7, type: 'Affirmation', mood: 'Calm',
    title: 'This feeling is temporary. I have been calm before and I will be again.',
    body: 'Anxiety lies to you. It tells you this state will last forever. It won\'t. You have returned to calm before. You will return again.',
    author: 'Daily Affirmation', likes: 73, saves: 44, icon: '⭐', featured: false,
  },
  {
    id: 8, type: 'Story', mood: 'Gratitude',
    title: 'What Noticing the Birds Taught Me',
    body: 'I spent 10 minutes just watching birds from my window. No phone, no agenda. I noticed a sparrow land and look around, completely present. I thought: that\'s all I need to do today too.',
    author: 'Community Story', likes: 38, saves: 17, icon: '📖', featured: false,
  },
  {
    id: 9, type: 'Quote', mood: 'Positive',
    title: '"Be the change you wish to see in the world."',
    body: 'Not a call to grand gestures — but to small, daily ones. A kind word. A patient breath. A gentle choice.',
    author: 'Mahatma Gandhi', likes: 88, saves: 52, icon: '💬', featured: false,
  },
  {
    id: 10, type: 'Affirmation', mood: 'Positive',
    title: 'I am building something — even on the days I can\'t see it.',
    body: 'Progress often happens invisibly. Like roots underground before the flower appears. Keep going.',
    author: 'Daily Affirmation', likes: 66, saves: 35, icon: '⭐', featured: false,
  },
  {
    id: 11, type: 'Quote', mood: 'Calm',
    title: '"Wherever you are, be all there."',
    body: 'Jim Elliot\'s words are a prescription for the modern age. Half-present everywhere, fully present nowhere — that\'s the trap. Choose one thing.',
    author: 'Jim Elliot', likes: 44, saves: 23, icon: '💬', featured: false,
  },
  {
    id: 12, type: 'Story', mood: 'Positive',
    title: 'Why I Journal Every Morning Now',
    body: 'I used to think journaling was for people with more interesting lives than mine. Then I tried it for 7 days. I discovered I had more thoughts, feelings, and insights than I\'d ever acknowledged.',
    author: 'LTP Community', likes: 51, saves: 29, icon: '📖', featured: false,
  },
]

const TYPE_ICONS: Record<string, string> = { Quote: '💬', Affirmation: '⭐', Story: '📖', Audio: '🎧', Video: '🎬' }
const MOOD_COLORS: Record<string, string> = {
  Positive: 'bg-amber/15 text-amber',
  Calm:     'bg-teal-ghost text-teal-deep',
  Gratitude: 'bg-green-50 text-green-700',
}

const TYPES = ['All', 'Quote', 'Affirmation', 'Story']
const MOODS = ['All', 'Positive', 'Calm', 'Gratitude']

export default function FeedPage() {
  const [typeFilter, setTypeFilter] = useState('All')
  const [moodFilter, setMoodFilter] = useState('All')
  const [liked, setLiked]   = useState<Set<number>>(new Set())
  const [saved, setSaved]   = useState<Set<number>>(new Set())

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })

  // Daily featured item — rotates by date
  const dailyIndex = Math.floor(Date.now() / 86400000) % ALL_FEED_ITEMS.length
  const dailyItem  = ALL_FEED_ITEMS[dailyIndex]

  const filtered = useMemo(() => ALL_FEED_ITEMS.filter(item => {
    const matchType = typeFilter === 'All' || item.type === typeFilter
    const matchMood = moodFilter === 'All' || item.mood === moodFilter
    return matchType && matchMood
  }), [typeFilter, moodFilter])

  const toggleLike = (id: number) => setLiked(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleSave = (id: number) => setSaved(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
            <span className="w-6 h-0.5 bg-amber rounded" /> Daily Feed
          </div>
          <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-bold leading-snug mb-3">
            Fresh inspiration, <em className="italic text-amber-soft">every day.</em>
          </h1>
          <p className="text-white/72 text-[1rem] leading-[1.8]">{today}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto py-14 px-[5%]">

        {/* New Today Banner */}
        <div className="mb-10 bg-amber-pale border border-amber/30 rounded-[20px] px-6 py-4 flex items-center gap-3">
          <span className="text-[1.5rem]">✨</span>
          <p className="text-charcoal font-medium text-[0.95rem]">
            <strong>New Today —</strong> Discover a fresh dose of inspiration!
            <Link href="#daily" className="text-teal-mid ml-2 hover:underline">See today&apos;s pick ↓</Link>
          </p>
        </div>

        {/* Today's Pick */}
        <div id="daily" className="mb-14">
          <h2 className="font-display text-[1.1rem] text-charcoal font-semibold mb-5">🌟 Today&apos;s Pick</h2>
          <div className="bg-gradient-to-br from-teal-deep to-teal-dark rounded-[24px] p-8 md:p-10 text-white">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[1.6rem]">{TYPE_ICONS[dailyItem.type]}</span>
              <span className="text-[0.7rem] font-bold tracking-[0.15em] uppercase text-amber-soft">{dailyItem.type}</span>
              <span className={`text-[0.68rem] font-bold px-2.5 py-0.5 rounded-full ${MOOD_COLORS[dailyItem.mood] ?? ''} opacity-80`}>{dailyItem.mood}</span>
            </div>
            <blockquote className="font-display text-[1.3rem] italic text-white leading-[1.6] mb-4">
              {dailyItem.title}
            </blockquote>
            <p className="text-white/70 text-[0.95rem] leading-[1.8] mb-5">{dailyItem.body}</p>
            <div className="flex items-center justify-between">
              <p className="text-white/50 text-[0.82rem]">— {dailyItem.author}</p>
              <div className="flex gap-3">
                <button onClick={() => toggleLike(dailyItem.id)}
                  className={`flex items-center gap-1.5 text-[0.82rem] px-3 py-1.5 rounded-full transition-all ${liked.has(dailyItem.id) ? 'bg-red-400/20 text-red-300' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                  {liked.has(dailyItem.id) ? '❤️' : '🤍'} {dailyItem.likes + (liked.has(dailyItem.id) ? 1 : 0)}
                </button>
                <button onClick={() => toggleSave(dailyItem.id)}
                  className={`flex items-center gap-1.5 text-[0.82rem] px-3 py-1.5 rounded-full transition-all ${saved.has(dailyItem.id) ? 'bg-amber/30 text-amber-soft' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                  {saved.has(dailyItem.id) ? '🔖' : '📌'} Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap mb-8">
          <div className="flex gap-2">
            {TYPES.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-4 py-1.5 rounded-full text-[0.82rem] font-medium transition-all ${typeFilter === t ? 'bg-teal-deep text-white' : 'bg-teal-ghost text-teal-deep hover:bg-teal-light/40'}`}>
                {t !== 'All' ? TYPE_ICONS[t] : ''} {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {MOODS.map(m => (
              <button key={m} onClick={() => setMoodFilter(m)}
                className={`px-4 py-1.5 rounded-full text-[0.82rem] font-medium transition-all ${moodFilter === m ? 'bg-teal-deep text-white' : 'bg-teal-ghost text-teal-deep hover:bg-teal-light/40'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div key={item.id} className="bg-white border border-teal-light rounded-[24px] p-7 flex flex-col hover:-translate-y-1 hover:shadow-lift transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[1.4rem]">{item.icon}</span>
                  <span className="text-[0.7rem] font-bold tracking-[0.12em] uppercase text-teal-mid">{item.type}</span>
                </div>
                <span className={`text-[0.68rem] font-bold px-2.5 py-0.5 rounded-full ${MOOD_COLORS[item.mood] ?? 'bg-teal-ghost text-teal-deep'}`}>{item.mood}</span>
              </div>
              <p className="font-display text-[1.02rem] italic text-charcoal leading-[1.6] mb-3 flex-1">{item.title}</p>
              <p className="text-[0.85rem] text-text-light leading-[1.7] mb-4">{item.body}</p>
              <div className="flex items-center justify-between text-[0.78rem] text-text-xlight border-t border-teal-light/40 pt-4 mt-auto">
                <span>{item.author}</span>
                <div className="flex gap-2">
                  <button onClick={() => toggleLike(item.id)}
                    className={`flex items-center gap-1 transition-colors ${liked.has(item.id) ? 'text-red-400' : 'hover:text-red-400'}`}>
                    {liked.has(item.id) ? '❤️' : '🤍'} {item.likes + (liked.has(item.id) ? 1 : 0)}
                  </button>
                  <button onClick={() => toggleSave(item.id)}
                    className={`flex items-center gap-1 transition-colors ${saved.has(item.id) ? 'text-amber' : 'hover:text-amber'}`}>
                    {saved.has(item.id) ? '🔖' : '📌'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
