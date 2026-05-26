import Link from 'next/link'

const pillars = [
  {
    icon: '🪷',
    title: 'Mindfulness',
    text: 'Discover simple techniques to quiet your mind and find inner peace.',
    href: '/library?category=Mindfulness',
    color: 'group-hover:from-teal-mid group-hover:to-teal-deep',
  },
  {
    icon: '💛',
    title: 'Gratitude',
    text: 'Cultivate appreciation for the good things in your life.',
    href: '/journal',
    color: 'group-hover:from-amber group-hover:to-amber',
  },
  {
    icon: '👣',
    title: 'Movement',
    text: 'Reconnect with your body and boost your mood through gentle, joyful movement.',
    href: '/library?category=Movement',
    color: 'group-hover:from-teal-mid group-hover:to-teal-deep',
  },
  {
    icon: '🌙',
    title: 'Sleep',
    text: 'Create a relaxing bedtime routine and improve your sleep quality.',
    href: '/meditation',
    color: 'group-hover:from-teal-dark group-hover:to-teal-deep',
  },
  {
    icon: '⭐',
    title: 'Positive Affirmations',
    text: 'Plant seeds of self-belief and confidence through intentional daily practice.',
    href: '/library/positive-affirmations-that-work',
    color: 'group-hover:from-amber group-hover:to-amber',
  },
]

export function WellnessPillars() {
  return (
    <section className="bg-white py-20 px-[5%]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 text-teal-mid text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4 section-label">
          Five Pillars of Wellbeing
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <h2 className="font-display text-[clamp(1.9rem,3vw,2.8rem)] text-charcoal leading-snug">
            Find your calm, <em className="text-teal-deep italic">one pillar at a time.</em>
          </h2>
          <Link href="/challenges"
            className="flex-shrink-0 text-[0.88rem] font-medium text-teal-mid no-underline hover:text-teal-deep transition-colors">
            Explore Challenges →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {pillars.map((p) => (
            <Link key={p.title} href={p.href}
              className="group block bg-ivory rounded-[24px] p-8 border border-teal-light no-underline
                hover:-translate-y-2 hover:shadow-lift transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-mid to-amber scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              <span className="text-[2.4rem] mb-4 block">{p.icon}</span>
              <h3 className="font-body text-[0.97rem] font-bold text-teal-deep mb-2">{p.title}</h3>
              <p className="text-[0.83rem] text-text-light leading-[1.7]">{p.text}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
