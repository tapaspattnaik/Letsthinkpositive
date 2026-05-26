import Link from 'next/link'

const traits = [
  'Listens — really listens — without rushing to fix',
  'Refuses to stay down on the hard days',
  'Knows that controlling your thoughts is the greatest discipline',
  'Makes others feel seen, heard, and less alone',
  'Passes it on. Always.',
]

export function SuperbManSection() {
  return (
    <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <div>
          <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
            <span className="w-6 h-0.5 bg-amber rounded flex-shrink-0" />
            Meet Our Founder
          </div>
          <h2 className="font-display text-[clamp(1.9rem,3vw,2.8rem)] text-white leading-snug mb-5">
            The mind behind <em className="italic text-amber-soft">this.</em> 👋
          </h2>
          <p className="text-white/78 text-[1rem] leading-[1.85] mb-4">
            Tapas Pattanaik is an IT professional, a mindset explorer, and someone who once spent a long time looking for a Superman — before realising the world needs something better.
          </p>
          <p className="text-white/78 text-[1rem] leading-[1.85] mb-4">
            Not a superhero. A <strong className="text-amber-soft">SuperbMan</strong>. Someone who listens, understands, walks alongside others, and believes that one conversation — one thought — can quietly change the direction of a life.
          </p>
          <p className="text-white/78 text-[1rem] leading-[1.85] mb-6">
            That belief is why this community exists.
          </p>
          <Link href="/about"
            className="inline-flex items-center gap-2 bg-amber text-charcoal px-8 py-3.5 rounded-full font-semibold text-[0.95rem] no-underline hover:bg-amber-soft hover:-translate-y-0.5 transition-all">
            Our Story →
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/8 border border-teal-light/25 rounded-[24px] p-10 backdrop-blur-sm">
          <h3 className="font-display text-[1.5rem] italic text-amber-soft mb-6">What is a SuperbMan?</h3>
          {traits.map((trait, i) => (
            <div key={i} className="flex gap-4 mb-4 last:mb-0">
              <div className="w-2 h-2 rounded-full bg-amber flex-shrink-0 mt-[0.55rem]" />
              <p className="text-[0.9rem] text-white/75 leading-[1.7]">{trait}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
