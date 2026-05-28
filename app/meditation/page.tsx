import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Guided Meditation',
  description: 'Find your calm with guided meditation sessions designed for sleep, anxiety, focus, and morning peace. From 5 to 30 minutes.',
}

const sessions = [
  {
    id: 'sleep-10',
    icon: '🌙',
    title: '10-Minute Guided Sleep Meditation',
    length: '10 min',
    focus: 'Sleep · Relaxation',
    description: 'Drift off to a tranquil night\'s sleep with this calming guided meditation. Gentle body scan, slow breathing, and peaceful imagery guide you into deep rest.',
    category: 'Sleep',
    featured: true,
    color: 'from-[#0F2040] to-[#1A3060]',
    textColor: 'text-white',
  },
  {
    id: 'morning-5',
    icon: '☀️',
    title: '5-Minute Morning Awakening',
    length: '5 min',
    focus: 'Energy · Intention',
    description: 'Start your day with clarity and calm. This short practice sets a positive intention and gently wakes up your mind and body.',
    category: 'Morning',
    featured: false,
    color: 'from-amber/20 to-amber/5',
    textColor: 'text-charcoal',
  },
  {
    id: 'anxiety-relief-8',
    icon: '🌬️',
    title: '8-Minute Anxiety Relief',
    length: '8 min',
    focus: 'Anxiety · Calm',
    description: 'When worry takes over, this breath-focused practice gently brings you back to the present. Proven breathing patterns combined with calming visualisation.',
    category: 'Anxiety',
    featured: false,
    color: 'from-teal-ghost to-white',
    textColor: 'text-charcoal',
  },
  {
    id: 'gratitude-7',
    icon: '💛',
    title: '7-Minute Gratitude Meditation',
    length: '7 min',
    focus: 'Gratitude · Positivity',
    description: 'Open your heart and cultivate deep appreciation. This warm, gentle practice uses visualisation to anchor gratitude in the body.',
    category: 'Gratitude',
    featured: false,
    color: 'from-amber/15 to-white',
    textColor: 'text-charcoal',
  },
  {
    id: 'focus-12',
    icon: '🎯',
    title: '12-Minute Focus & Clarity',
    length: '12 min',
    focus: 'Focus · Productivity',
    description: 'Clear the mental fog before deep work. This practice trains your attention, quiets distraction, and prepares your mind for clear, intentional thinking.',
    category: 'Focus',
    featured: false,
    color: 'from-teal-ghost to-white',
    textColor: 'text-charcoal',
  },
  {
    id: 'compassion-10',
    icon: '🌿',
    title: '10-Minute Self-Compassion',
    length: '10 min',
    focus: 'Self-Care · Healing',
    description: 'The hardest person to be kind to is often yourself. This loving-kindness practice teaches you to offer yourself the same compassion you\'d give a dear friend.',
    category: 'Self-Care',
    featured: false,
    color: 'from-teal-ghost to-white',
    textColor: 'text-charcoal',
  },
  {
    id: 'sleep-stories',
    icon: '📖',
    title: 'Guided Sleep Story Collection',
    length: '15–30 min',
    focus: 'Sleep · Relaxation',
    description: 'NEW — Drift off to a tranquil night with our latest audio sleep stories. A calm narrator weaves gentle imagery that eases your mind into rest.',
    category: 'Sleep',
    featured: false,
    color: 'from-[#0F2040] to-[#1A3060]',
    textColor: 'text-white',
    badge: '✨ New',
  },
]

const categories = ['All', 'Sleep', 'Morning', 'Anxiety', 'Gratitude', 'Focus', 'Self-Care']

export default function MeditationPage() {
  const featured = sessions.find(s => s.featured)!

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white overflow-hidden relative">
        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(232,160,32,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
              <span className="w-6 h-0.5 bg-amber rounded" /> Guided Meditation
            </div>
            <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-bold leading-snug mb-4">
              Close your eyes. <em className="italic text-amber-soft">Begin.</em>
            </h1>
            <p className="text-white/72 text-[1.05rem] leading-[1.8] max-w-[500px] mb-6">
              Guided sessions for sleep, anxiety, focus, and morning calm. From 5 to 30 minutes — wherever you are, whenever you need it.
            </p>
            <p className="text-white/50 text-[0.85rem] italic">
              🎧 Use headphones for the best experience. Audio files coming soon — save your favourites now.
            </p>
          </div>
          {/* Quote */}
          <div className="flex-shrink-0 w-full md:w-[340px] bg-white/8 border border-white/15 rounded-[24px] p-8 backdrop-blur-sm">
            <p className="font-display text-[1.2rem] italic text-amber-soft leading-[1.6] mb-4">
              &ldquo;Close your eyes, take a deep breath, and let go of your worries.&rdquo;
            </p>
            <p className="text-white/50 text-[0.82rem]">— letsthinkpositive.com</p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto py-14 px-[5%]">

        {/* Featured */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[0.7rem] font-bold tracking-[0.15em] uppercase text-teal-mid">⭐ Featured Session</span>
          </div>
          <div className={`bg-gradient-to-br ${featured.color} rounded-[28px] p-10 flex flex-col md:flex-row md:items-center gap-8`}>
            <div className="flex-1">
              <span className="text-[3.5rem] block mb-3">{featured.icon}</span>
              <span className="text-[0.7rem] font-bold tracking-[0.12em] uppercase bg-white/20 text-white px-3 py-1 rounded-full inline-block mb-4">
                {featured.focus} · {featured.length}
              </span>
              <h2 className="font-display text-[1.8rem] text-white font-semibold mb-3">{featured.title}</h2>
              <p className="text-white/75 text-[1rem] leading-[1.75] max-w-[500px]">{featured.description}</p>
            </div>
            <div className="flex-shrink-0 text-center">
              <button className="w-20 h-20 rounded-full bg-white/15 border-2 border-white/40 flex items-center justify-center hover:bg-white/25 transition-colors cursor-pointer mx-auto mb-3">
                <span className="text-[2rem] ml-1">▶</span>
              </button>
              <p className="text-white/60 text-[0.78rem]">Audio coming soon</p>
            </div>
          </div>
        </div>

        {/* All Sessions */}
        <div>
          <h2 className="font-display text-[1.15rem] text-charcoal font-semibold mb-6">All Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.filter(s => !s.featured).map(s => (
              <div key={s.id}
                className={`bg-gradient-to-br ${s.color} border border-teal-light rounded-[24px] p-7 flex flex-col`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[2.2rem]">{s.icon}</span>
                  {s.badge && (
                    <span className="text-[0.68rem] font-bold bg-amber text-charcoal px-2.5 py-1 rounded-full">{s.badge}</span>
                  )}
                </div>
                <span className={`text-[0.7rem] font-bold tracking-[0.12em] uppercase mb-2 ${s.textColor === 'text-white' ? 'text-white/60' : 'text-teal-mid'}`}>
                  {s.focus} · {s.length}
                </span>
                <h3 className={`font-body font-bold text-[1rem] mb-2 leading-snug ${s.textColor}`}>{s.title}</h3>
                <p className={`text-[0.875rem] leading-[1.7] mb-5 flex-1 ${s.textColor === 'text-white' ? 'text-white/70' : 'text-text-light'}`}>
                  {s.description}
                </p>
                <button
                  disabled
                  aria-disabled="true"
                  className={`w-full py-2.5 rounded-full font-semibold text-[0.85rem] cursor-not-allowed opacity-60
                  ${s.textColor === 'text-white'
                    ? 'bg-white/15 text-white border border-white/25'
                    : 'bg-teal-deep text-white'}`}>
                  ▶ Listen (Coming Soon)
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Promo: Sleep Stories */}
        <div className="mt-14 bg-gradient-to-br from-[#0F2040] to-[#1A3060] rounded-[28px] p-10 text-white text-center">
          <span className="text-[3rem] block mb-4">🌛</span>
          <span className="text-[0.7rem] font-bold tracking-[0.15em] uppercase text-amber-soft block mb-3">New Release</span>
          <h2 className="font-display text-[1.8rem] font-semibold mb-3">Guided Sleep Stories</h2>
          <p className="text-white/70 text-[1rem] leading-[1.8] max-w-[480px] mx-auto mb-6">
            Drift off to a tranquil night's sleep with our latest audio collection. A calm narrator and gentle soundscapes ease you from the day into deep, restful sleep.
          </p>
          <Link href="/sounds"
            className="inline-flex items-center gap-2 bg-amber text-charcoal px-8 py-3.5 rounded-full font-semibold text-[0.95rem] no-underline hover:bg-amber-soft transition-colors">
            Explore Calm Sounds →
          </Link>
        </div>
      </div>
    </>
  )
}
