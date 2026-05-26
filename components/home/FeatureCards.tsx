import Link from 'next/link'

const features = [
  {
    href:    '/journal',
    icon:    '📓',
    title:   'Gratitude Journal',
    text:    'A private, calming space to write what you\'re grateful for — with daily prompts, mood tracking, and streak celebrations.',
    color:   'from-teal-deep to-teal-mid',
  },
  {
    href:    '/sounds',
    icon:    '🎧',
    title:   'Keep Calm Sounds',
    text:    'Layer rain, forest, ocean, and Tibetan bowls into your perfect ambient soundscape. Set a timer and breathe.',
    color:   'from-[#1A5E6B] to-teal-mid',
  },
  {
    href:    '/advisor',
    icon:    '✨',
    title:   'Bit Advisor',
    text:    'A compassionate AI companion that listens, analyses your mood, offers wisdom, and guides you through meditation — any time.',
    color:   'from-teal-dark to-teal-deep',
  },
]

export function FeatureCards() {
  return (
    <section className="bg-ivory py-20 px-[5%]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 text-teal-mid text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4 section-label">
          Our Tools
        </div>
        <h2 className="font-display text-[clamp(1.9rem,3vw,2.8rem)] text-charcoal leading-snug mb-10">
          Three spaces to <em className="text-teal-deep italic">come back to</em>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(f => (
            <Link key={f.href} href={f.href}
              className={`bg-gradient-to-br ${f.color} rounded-[24px] p-8 text-white no-underline group hover:-translate-y-1.5 hover:shadow-lift transition-all duration-300`}>
              <span className="text-[2.5rem] mb-5 block">{f.icon}</span>
              <h3 className="font-body font-bold text-[1.1rem] mb-3">{f.title}</h3>
              <p className="text-white/75 text-[0.9rem] leading-[1.75] mb-5">{f.text}</p>
              <span className="text-amber-soft text-[0.85rem] font-semibold group-hover:gap-2 transition-all">Open →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
