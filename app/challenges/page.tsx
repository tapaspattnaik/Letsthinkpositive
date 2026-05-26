import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Wellness Challenges',
  description: 'Join 7, 21, or 30-day wellness challenges designed to build lasting habits in gratitude, mindfulness, sleep, movement, and positivity.',
}

const challenges = [
  {
    id: 'gratitude-30',
    icon: '🍂',
    title: '30-Day Gratitude Challenge',
    description: 'Cultivate a daily habit of gratitude by focusing on the good things in your life. Each day, identify and appreciate 3 things you\'re thankful for.',
    duration: '30 Days',
    category: 'Mindfulness & Positivity',
    outcome: 'Increased feelings of happiness and appreciation.',
    difficulty: 'Easy',
    color: 'from-amber/20 to-amber/5',
    borderColor: 'border-amber/40',
    badgeColor: 'bg-amber/15 text-amber',
    cta: 'Join the 30-Day Gratitude Challenge',
    startAction: 'Start by listing 3 things you\'re grateful for this evening.',
    banner: 'Unlock a more positive outlook — one small step at a time!',
    popular: true,
  },
  {
    id: 'mindfulness-7',
    icon: '🧘',
    title: '7-Day Morning Mindfulness',
    description: 'Begin each morning with a 5-minute mindfulness practice. Simple, quiet, transformative. No experience needed — just willingness.',
    duration: '7 Days',
    category: 'Mindfulness',
    outcome: 'Calmer mornings and improved focus throughout the day.',
    difficulty: 'Easy',
    color: 'from-teal-ghost to-white',
    borderColor: 'border-teal-light',
    badgeColor: 'bg-teal-ghost text-teal-deep',
    cta: 'Start Your 7-Day Mornings',
    startAction: 'Read the 5-Minute Morning Mindfulness article in the Library, then practise tomorrow morning.',
    banner: 'Seven mornings. Seven chances to begin again.',
    popular: false,
  },
  {
    id: 'movement-7',
    icon: '👣',
    title: '7 Days of Gentle Movement',
    description: 'Reconnect with your body through gentle daily movement — a walk, a stretch, a dance in your room. No gym required.',
    duration: '7 Days',
    category: 'Movement & Wellbeing',
    outcome: 'Improved mood, energy, and body awareness.',
    difficulty: 'Easy',
    color: 'from-teal-ghost to-white',
    borderColor: 'border-teal-light',
    badgeColor: 'bg-teal-ghost text-teal-deep',
    cta: 'Begin 7 Days of Movement',
    startAction: 'Take a 20-minute walk today. That\'s it. That\'s day one.',
    banner: 'Challenge of the Week — starting fresh every Monday.',
    popular: false,
    weeklyChallenge: true,
  },
  {
    id: 'sleep-21',
    icon: '🌙',
    title: '21-Day Sleep Reset',
    description: 'Build a consistent, calming bedtime routine that tells your mind and body: it\'s safe to rest now. Step by step, over three weeks.',
    duration: '21 Days',
    category: 'Sleep',
    outcome: 'Falling asleep faster and waking up genuinely refreshed.',
    difficulty: 'Moderate',
    color: 'from-[#1A2B4A]/10 to-white',
    borderColor: 'border-[#1A2B4A]/20',
    badgeColor: 'bg-[#1A2B4A]/10 text-[#1A2B4A]',
    cta: 'Begin Your Sleep Reset',
    startAction: 'Tonight, charge your phone outside the bedroom and read for 15 minutes before sleep.',
    banner: 'Three weeks to a new relationship with rest.',
    popular: false,
  },
  {
    id: 'affirmations-21',
    icon: '⭐',
    title: '21-Day Affirmation Practice',
    description: 'Plant seeds of self-belief through daily affirmations. We\'ll guide you through the science-backed approach — not toxic positivity, but honest, gentle self-talk.',
    duration: '21 Days',
    category: 'Positive Affirmations',
    outcome: 'A kinder, quieter inner voice and stronger self-belief.',
    difficulty: 'Easy',
    color: 'from-amber/15 to-white',
    borderColor: 'border-amber/30',
    badgeColor: 'bg-amber/15 text-amber',
    cta: 'Start the Affirmation Practice',
    startAction: 'Read our Affirmations article in the Library and choose 2 that resonate with you.',
    banner: 'The words you speak to yourself become the story you live.',
    popular: false,
  },
  {
    id: 'journal-14',
    icon: '📓',
    title: '14-Day Gratitude Journaling',
    description: 'Write in the Gratitude Journal every day for two weeks. Daily prompts keep it fresh. Streaks keep it going.',
    duration: '14 Days',
    category: 'Gratitude',
    outcome: 'A daily writing habit and measurably improved mood.',
    difficulty: 'Easy',
    color: 'from-teal-ghost to-white',
    borderColor: 'border-teal-light',
    badgeColor: 'bg-teal-ghost text-teal-deep',
    cta: 'Begin the Journal Challenge',
    startAction: 'Open the Gratitude Journal and write today\'s entry right now.',
    banner: '14 days. 14 new moments of appreciation.',
    popular: false,
  },
]

export default function ChallengesPage() {
  const weekly = challenges.find(c => c.weeklyChallenge)
  const featured = challenges.find(c => c.popular)
  const rest = challenges.filter(c => !c.popular && !c.weeklyChallenge)

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
            <span className="w-6 h-0.5 bg-amber rounded" /> Wellness Challenges
          </div>
          <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-bold leading-snug mb-4">
            Small steps. <em className="italic text-amber-soft">Real change.</em>
          </h1>
          <p className="text-white/72 text-[1.05rem] leading-[1.8] max-w-[560px]">
            Join a challenge and build one positive habit at a time. Each programme is designed to be realistic, gentle, and genuinely effective.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto py-14 px-[5%]">

        {/* Challenge of the Week */}
        {weekly && (
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="bg-amber text-charcoal text-[0.7rem] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full">
                🔄 Challenge of the Week
              </span>
            </div>
            <div className={`bg-gradient-to-br ${weekly.color} border ${weekly.borderColor} rounded-[28px] p-8 md:p-10`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[3rem] block mb-3">{weekly.icon}</span>
                  <div className={`inline-block text-[0.7rem] font-bold tracking-[0.12em] uppercase px-3 py-1 rounded-full mb-3 ${weekly.badgeColor}`}>
                    {weekly.duration} · {weekly.difficulty}
                  </div>
                  <h2 className="font-display text-[1.6rem] text-charcoal font-semibold mb-3">{weekly.title}</h2>
                  <p className="text-text-mid text-[1rem] leading-[1.75] max-w-[520px] mb-4">{weekly.description}</p>
                  <p className="text-[0.88rem] text-text-light italic">
                    💡 <strong>Start here:</strong> {weekly.startAction}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Link href="/journal"
                    className="block bg-teal-deep text-white px-8 py-3.5 rounded-full font-semibold text-[0.95rem] no-underline hover:bg-teal-dark hover:-translate-y-0.5 transition-all text-center whitespace-nowrap">
                    {weekly.cta} →
                  </Link>
                  <p className="text-[0.78rem] text-text-xlight text-center mt-3">{weekly.banner}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Featured */}
        {featured && (
          <div className="mb-14">
            <h2 className="font-display text-[1.15rem] text-charcoal font-semibold mb-5 flex items-center gap-2">
              🏆 Most Popular
            </h2>
            <ChallengeCard c={featured} large />
          </div>
        )}

        {/* All Challenges */}
        <div>
          <h2 className="font-display text-[1.15rem] text-charcoal font-semibold mb-6">All Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map(c => <ChallengeCard key={c.id} c={c} />)}
          </div>
        </div>
      </div>
    </>
  )
}

function ChallengeCard({ c, large = false }: { c: typeof challenges[number], large?: boolean }) {
  const href = c.id === 'journal-14' ? '/journal' : c.id === 'mindfulness-7' ? '/library/5-minute-morning-mindfulness-meditation' : '/journal'
  return (
    <div className={`bg-gradient-to-br ${c.color} border ${c.borderColor} rounded-[24px] p-8 flex flex-col h-full ${large ? 'md:flex-row md:gap-8 md:items-start' : ''}`}>
      <div className={large ? 'flex-1' : ''}>
        <span className="text-[2.4rem] block mb-3">{c.icon}</span>
        <div className={`inline-block text-[0.68rem] font-bold tracking-[0.12em] uppercase px-3 py-1 rounded-full mb-3 ${c.badgeColor}`}>
          {c.duration} · {c.difficulty}
        </div>
        <h3 className="font-display text-[1.25rem] text-charcoal font-semibold mb-2">{c.title}</h3>
        <p className="text-text-mid text-[0.9rem] leading-[1.75] mb-3">{c.description}</p>
        <p className="text-[0.82rem] text-text-light mb-1">
          <strong className="text-charcoal">Goal:</strong> {c.outcome}
        </p>
        <p className="text-[0.82rem] text-teal-mid italic mb-5">
          💡 {c.startAction}
        </p>
      </div>
      <div className={large ? 'flex-shrink-0 self-end md:self-center' : 'mt-auto'}>
        <Link href={href}
          className="block bg-teal-deep text-white px-6 py-3 rounded-full font-semibold text-[0.88rem] no-underline hover:bg-teal-dark transition-colors text-center">
          {c.cta} →
        </Link>
      </div>
    </div>
  )
}
