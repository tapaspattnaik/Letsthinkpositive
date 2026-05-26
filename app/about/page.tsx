import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description: 'The story behind letsthinkpositive — Tapas Pattanaik, the SuperbMan philosophy, and why this community exists.',
}

const values = [
  { icon: '🎧', title: 'Listens First',             text: 'Really listens — without thinking about what to say next. People often feel better simply because someone heard them.' },
  { icon: '💪', title: 'Gets Back Up',               text: 'Does not pretend the hard days aren\'t hard. They just refuse to stay down. Resilience is a practice, not a personality trait.' },
  { icon: '🧠', title: 'Controls the Inner World',   text: 'Understands that controlling your thoughts is not weakness — it is the most courageous discipline there is.' },
  { icon: '🤝', title: 'Makes Others Feel Seen',     text: 'Makes the people around them feel heard, valued, and less alone. That is true leadership — and true kindness.' },
  { icon: '🌱', title: 'Starts From Within',         text: 'Every movement, every change, every better world starts from one person deciding to think differently.' },
  { icon: '🌊', title: 'Passes It On',               text: 'Shares what they learn. Opens the door for the next person. Makes positivity contagious — one ripple at a time.' },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-dark to-teal-deep py-24 px-[5%] text-center text-white">
        <div className="flex items-center justify-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-5">
          <span className="w-6 h-0.5 bg-amber rounded" />Our Story
        </div>
        <h1 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold mb-4">
          From a Dream to a <em className="italic text-amber-soft">Movement</em>
        </h1>
        <p className="text-white/70 text-[1.1rem] max-w-[560px] mx-auto">
          This is not a corporate mission statement. It is a real story — about real struggles, real discoveries, and a collective decision to hold the door open for others.
        </p>
      </section>

      {/* Story */}
      <article className="max-w-[760px] mx-auto py-20 px-[5%]">
        <p className="font-display italic text-[1.15rem] text-teal-deep mb-8">Our founder once wanted to be Superman.</p>

        <p className="text-[1.05rem] text-text-mid leading-[1.9] mb-5">
          Not metaphorically — as a small kid, Tapas Pattanaik genuinely believed the answer to the world&apos;s problems was a superhero. Someone with the power to fix everything, save everyone, and make the bad things stop.
        </p>
        <p className="text-[1.05rem] text-text-mid leading-[1.9] mb-5">
          It took time — and some genuinely hard seasons of life — to understand something important. Superman is a fantasy. A beautiful one, but a fantasy all the same.
        </p>

        <blockquote className="border-l-[5px] border-amber bg-teal-ghost px-8 py-6 rounded-r-card my-8">
          <p className="font-display italic text-[1.2rem] text-teal-deep leading-relaxed m-0">
            What the world actually needs is something far more human. It needs SuperbMen and SuperbWomen — people who cannot fly or stop bullets, but who can sit with someone in their pain and not flinch.
          </p>
        </blockquote>

        <p className="text-[1.05rem] text-text-mid leading-[1.9] mb-5">
          Growing up watching Mahatma Gandhi&apos;s three monkeys — see no evil, hear no evil, speak no evil — the lesson seemed simple. As life unfolded across a demanding corporate IT career, personal struggles, and the constant noise of modern living, the meaning deepened into something far greater.
        </p>
        <p className="text-[1.05rem] text-text-mid leading-[1.9] mb-5">
          We live in a world where bad news travels faster than kindness. You cannot simply close your eyes and ears to all of it. But you can — with practice, with intention, with the right community around you — learn to control your response to it.
        </p>

        <blockquote className="border-l-[5px] border-amber bg-teal-ghost px-8 py-6 rounded-r-card my-8">
          <p className="font-display italic text-[1.2rem] text-teal-deep leading-relaxed m-0">And that starts with your thoughts.</p>
        </blockquote>

        <p className="text-[1.05rem] text-text-mid leading-[1.9] mb-5">
          Tapas spent years in the corporate IT world — high-pressure meetings, moments of self-doubt, and late-night conversations with friends who had nowhere else to turn. On both sides — the one needing help, and the one offering it — a deep truth emerged.
        </p>
        <p className="text-[1.05rem] text-text-mid leading-[1.9] mb-5">
          The quality of a life is almost entirely determined by the quality of thinking. Not circumstances. Not salary. Not job title. Thinking.
        </p>

        <blockquote className="border-l-[5px] border-amber bg-teal-ghost px-8 py-6 rounded-r-card my-8">
          <p className="font-display italic text-[1.2rem] text-teal-deep leading-relaxed m-0">
            letsthinkpositive.com is the platform we wish had existed when we needed it most.
          </p>
        </blockquote>

        <p className="text-[1.05rem] text-text-mid leading-[1.9] mb-5">
          We are not here as gurus. We are here as fellow travellers — a growing community with an uncommon, stubborn, beautiful belief that positivity, practised together, can genuinely change the world.
        </p>
        <p className="italic text-teal-mid font-medium">— The letsthinkpositive.com team</p>
      </article>

      {/* Values */}
      <section className="bg-teal-ghost py-16 px-[5%]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-teal-mid text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4 section-label">Our Values</div>
          <h2 className="font-display text-[clamp(1.9rem,3vw,2.8rem)] text-charcoal leading-snug mb-8">
            Our <em className="text-teal-deep italic">SuperbMan</em> Philosophy
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map(v => (
              <div key={v.title} className="bg-white rounded-card p-7 border-l-4 border-teal-mid shadow-card">
                <h4 className="text-[1rem] font-bold text-teal-deep mb-2">{v.icon} {v.title}</h4>
                <p className="text-[0.9rem] text-text-light leading-[1.7]">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wisdom coaches CTA */}
      <section className="py-20 px-[5%] text-center bg-ivory">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 text-teal-mid text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4 section-label">Coming Soon</div>
          <h2 className="font-display text-[clamp(1.9rem,3vw,2.8rem)] text-charcoal leading-snug mb-4">
            Wisdom has <em className="text-teal-deep italic">no retirement age</em>
          </h2>
          <p className="text-text-light text-[1.05rem] leading-[1.8] max-w-[560px] mx-auto mb-8">
            One of the most exciting things we&apos;re building towards is a space for our elders — wise, experienced souls who have lived through more than most of us can imagine — to give back as coaches and guides.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-amber text-charcoal px-8 py-3.5 rounded-full font-semibold text-[0.95rem] no-underline hover:bg-amber-soft hover:-translate-y-0.5 transition-all">
            Express Your Interest →
          </Link>
        </div>
      </section>
    </>
  )
}
