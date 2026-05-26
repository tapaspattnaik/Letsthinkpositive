const pillars = [
  { icon: '🧠', title: 'Mental Wellness & Mindset',    text: 'Your thoughts are the most powerful thing you own. We help you understand them, challenge them, and gently retrain them — so they work for you, not against you.' },
  { icon: '💼', title: 'Career & Professional Growth', text: 'Your mindset at work is your most important qualification. We bring clarity, confidence, and purpose into your professional journey.' },
  { icon: '🌱', title: 'Life Coaching & Habits',       text: 'Big change lives in small, repeated choices. We help you build the habits that compound into a life you actually want to be living.' },
  { icon: '🎓', title: 'Student Motivation',           text: 'Students are not the future — they are the present. And they deserve someone who takes their inner world as seriously as their exam results.' },
]

const comingSoon = [
  { icon: '🧘', label: 'Yoga'           },
  { icon: '🥗', label: 'Positive Eating'},
  { icon: '⚡', label: 'Habits Lab'     },
  { icon: '👴', label: 'Wisdom Coaching'},
]

export function Pillars() {
  return (
    <section className="bg-ivory py-20 px-[5%]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 text-teal-mid text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4 section-label">
          What We Do
        </div>
        <h2 className="font-display text-[clamp(1.9rem,3vw,2.8rem)] text-charcoal leading-snug mb-3">
          Four ways we <em className="text-teal-deep italic">grow together</em>
        </h2>
        <p className="text-text-light text-[1.05rem] leading-[1.8] max-w-[560px] mb-10">
          Whether you&apos;re a student finding your feet, a professional navigating pressure, or someone who just needs to feel heard — there&apos;s a place for you here.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => (
            <div key={p.title}
              className="bg-white rounded-[24px] p-9 border border-teal-light relative overflow-hidden
                hover:-translate-y-1.5 hover:shadow-lift transition-all duration-300 group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-mid to-amber scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              <span className="text-[2.2rem] mb-4 block">{p.icon}</span>
              <h3 className="font-body text-[1.02rem] font-bold text-teal-deep mb-3">{p.title}</h3>
              <p className="text-[0.9rem] text-text-light leading-[1.75]">{p.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <p className="text-[0.9rem] text-text-light mb-3">Also coming soon:</p>
          <div className="flex gap-3 flex-wrap">
            {comingSoon.map(c => (
              <span key={c.label} className="inline-flex items-center gap-1.5 bg-teal-ghost text-teal-deep px-4 py-2 rounded-full text-[0.83rem] font-medium border border-dashed border-teal-light">
                {c.icon} {c.label} <span className="text-text-xlight text-[0.7rem]">— soon</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
