import Link from 'next/link'

const features = [
  { href: '/library',      icon: '📚', title: 'Wellness Library',   text: 'Evidence-backed articles on mindfulness, sleep, gratitude, and anxiety — curated to help you live better.', color: 'from-teal-deep to-teal-mid' },
  { href: '/challenges',   icon: '🏆', title: 'Challenges',         text: '7, 21, or 30-day programmes to build lasting wellness habits — gratitude, movement, sleep, and more.', color: 'from-amber to-[#D4880A]' },
  { href: '/coach',        icon: '🌿', title: 'Calm Coach',         text: 'Your AI wellness companion. Gentle prompts, reflective questions, and encouraging support — any time.', color: 'from-teal-mid to-teal-deep' },
  { href: '/meditation',   icon: '🧘', title: 'Guided Meditation',  text: 'Sleep, morning calm, anxiety relief, and focus sessions. From 5 to 30 minutes.', color: 'from-[#0F2040] to-[#1A3060]' },
  { href: '/journal',      icon: '📓', title: 'Gratitude Journal',  text: 'A private, calming space to write what you\'re grateful for — with daily prompts and mood tracking.', color: 'from-teal-deep to-teal-mid' },
  { href: '/sounds',       icon: '🎧', title: 'Keep Calm Sounds',   text: 'Layer rain, forest, ocean, and Tibetan bowls into your perfect ambient soundscape.', color: 'from-[#1A5E6B] to-teal-mid' },
  { href: '/feed',         icon: '✨', title: 'Daily Feed',         text: 'Fresh quotes, affirmations, and stories delivered daily. Like and save what resonates.', color: 'from-amber to-teal-mid' },
  { href: '/vision-board', icon: '⭐', title: 'Vision Board',       text: 'Create a visual map of your intentions and goals. Revisit it daily to stay grounded in your purpose.', color: 'from-teal-mid to-teal-dark' },
  { href: '/community',    icon: '💛', title: 'Community',          text: 'Real stories from real people. Share what\'s working, what\'s hard, and what\'s helping.', color: 'from-amber to-[#D4880A]' },
  { href: '/kids',         icon: '🌈', title: 'Kids Zone',          text: 'Fun, gentle activities to help children build calm, kindness, and gratitude — one smile at a time.', color: 'from-teal-deep to-teal-mid' },
  { href: '/drawing',      icon: '✏️', title: 'Positive Drawing',   text: 'Zentangle, mandala, ZenDoodle and more — meditative art styles that calm the mind with every stroke.', color: 'from-teal-mid to-teal-dark' },
  { href: '/good-news',    icon: '🌍', title: 'Good News',          text: 'Uplifting stories from around the globe — breakthroughs, kindness, and people making a real difference.', color: 'from-teal-dark to-teal-deep' },
]

export function FeatureCards() {
  return (
    <section className="bg-ivory py-20 px-[5%]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 text-teal-mid text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4 section-label">
          Everything in One Place
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <h2 className="font-display text-[clamp(1.9rem,3vw,2.8rem)] text-charcoal leading-snug">
            Your complete <em className="text-teal-deep italic">wellness toolkit.</em>
          </h2>
          <Link href="/library"
            className="flex-shrink-0 text-[0.88rem] font-medium text-teal-mid no-underline hover:text-teal-deep transition-colors">
            Start Your Journey →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <Link key={f.href} href={f.href}
              className={`bg-gradient-to-br ${f.color} rounded-[24px] p-8 text-white no-underline group hover:-translate-y-1.5 hover:shadow-lift transition-all duration-300`}>
              <span className="text-[2.5rem] mb-5 block">{f.icon}</span>
              <h3 className="font-body font-bold text-[1.05rem] mb-2">{f.title}</h3>
              <p className="text-white/70 text-[0.87rem] leading-[1.72] mb-5">{f.text}</p>
              <span className="text-amber-soft text-[0.82rem] font-semibold group-hover:ml-1 transition-all">Open →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
