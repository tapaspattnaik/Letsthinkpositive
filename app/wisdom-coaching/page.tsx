import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Wisdom Coaching — Life Guidance, Clarity & Purpose',
  description: 'Explore timeless wisdom, coaching frameworks, and practical tools for clarity, purpose, and meaningful living.',
}

const PILLARS = [
  { icon: '🧭', title: 'Clarity of Purpose', desc: 'Know your why. Purpose is not found — it\'s built through reflection, action, and alignment with your deepest values.' },
  { icon: '🌱', title: 'Growth Mindset', desc: 'Intelligence and character are not fixed. Every challenge is a classroom. Every failure is data. Embrace the process.' },
  { icon: '💙', title: 'Emotional Mastery', desc: 'You cannot choose your emotions, but you can choose your response. Wisdom is the space between stimulus and reaction.' },
  { icon: '🤝', title: 'Meaningful Relationships', desc: 'The quality of your life is largely determined by the quality of your relationships. Invest in people deliberately.' },
  { icon: '⚖️', title: 'Balance & Boundaries', desc: 'Saying no to the wrong things is how you say yes to the right ones. Boundaries are not walls — they are gates.' },
  { icon: '🎯', title: 'Intentional Living', desc: 'Most people live reactively. Wisdom coaching teaches you to design your life — then live it — with full intention.' },
]

const QUOTES = [
  { quote: 'Know thyself.', author: 'Socrates', context: 'The foundation of all wisdom is self-awareness.' },
  { quote: 'We suffer more in imagination than in reality.', author: 'Seneca', context: 'Most of what we fear never happens. Live in the present.' },
  { quote: 'Between stimulus and response there is a space. In that space is our power.', author: 'Viktor Frankl', context: 'Freedom lies in how we interpret what happens to us.' },
  { quote: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius', context: 'Obstacles are the path, not a detour from it.' },
  { quote: 'Comparison is the thief of joy.', author: 'Theodore Roosevelt', context: 'Run your own race. Your journey is not theirs.' },
  { quote: 'You have power over your mind, not outside events. Realise this, and you will find strength.', author: 'Marcus Aurelius', context: 'Focus only on what is within your circle of control.' },
]

const FRAMEWORKS = [
  {
    name: 'The Wheel of Life',
    icon: '⭕',
    desc: 'Rate 8 life areas (career, health, relationships, finances, personal growth, family, fun, spirituality) from 1–10. The gaps show where to focus.',
    areas: ['Career', 'Health', 'Relationships', 'Finances', 'Personal Growth', 'Family', 'Fun & Recreation', 'Spirituality'],
    color: 'bg-teal-ghost border-teal-light',
  },
  {
    name: 'The Ikigai Framework',
    icon: '🌸',
    desc: 'Japanese concept for your reason for being — the intersection of what you love, what you\'re good at, what the world needs, and what you can be paid for.',
    areas: ['What you LOVE', 'What you\'re GOOD AT', 'What the world NEEDS', 'What you can be PAID FOR'],
    color: 'bg-pink-50 border-pink-200',
  },
  {
    name: 'The 5 Regrets Framework',
    icon: '💭',
    desc: 'Based on Bronnie Ware\'s research with dying patients — use these regrets as a compass to make better decisions while you still can.',
    areas: ['I wish I\'d had the courage to live my life', 'I wish I hadn\'t worked so hard', 'I wish I\'d expressed my feelings', 'I wish I\'d stayed in touch with friends', 'I wish I\'d let myself be happier'],
    color: 'bg-purple-50 border-purple-200',
  },
]

const DAILY_PRACTICES = [
  { time: '🌅 Morning', practice: 'Morning Pages', how: 'Write 3 pages of stream-of-consciousness thought before checking your phone. Clears mental fog and surfaces insights.', duration: '20 min' },
  { time: '☀️ Midday', practice: 'Mindful Check-in', how: 'Pause. Ask: "Am I acting from fear or from values right now?" Adjust accordingly. A simple question that changes everything.', duration: '2 min' },
  { time: '🌙 Evening', practice: 'Gratitude + Lesson', how: 'Write 1 thing you\'re grateful for and 1 thing you learned today. Do this for 30 days and watch your perspective shift permanently.', duration: '5 min' },
  { time: '📅 Weekly', practice: 'Weekly Review', how: 'Review your goals, your habits, and your energy. What went well? What would you do differently? Design the week ahead with intention.', duration: '30 min' },
]

export default function WisdomCoachingPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-[#2A1A4A] to-teal-dark py-20 px-[5%] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
            <span className="w-6 h-0.5 bg-amber rounded" /> Wellness · Coaching
          </div>
          <h1 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-snug mb-4">
            Ancient wisdom. <em className="italic text-amber-soft">Modern living.</em>
          </h1>
          <p className="text-white/75 text-[1.05rem] leading-[1.8] max-w-[580px] mb-6">
            Wisdom coaching draws from Stoicism, Eastern philosophy, positive psychology, and modern coaching science to help you live with greater clarity, purpose, and peace.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-[5%] py-14 space-y-16">

        {/* Pillars */}
        <section>
          <h2 className="font-display text-[1.7rem] font-bold text-charcoal mb-2">Six Pillars of Wisdom Living</h2>
          <p className="text-text-mid text-[0.95rem] mb-8 max-w-[600px]">These are the domains where wisdom makes the greatest difference in the quality of your everyday life.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PILLARS.map(p => (
              <div key={p.title} className="bg-white border border-teal-light rounded-[20px] p-6 shadow-card hover:-translate-y-1 hover:shadow-lift transition-all">
                <span className="text-[2rem] block mb-3">{p.icon}</span>
                <h3 className="font-bold text-charcoal text-[1rem] mb-2">{p.title}</h3>
                <p className="text-[0.87rem] text-text-mid leading-[1.75]">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quotes */}
        <section>
          <h2 className="font-display text-[1.7rem] font-bold text-charcoal mb-2">Words That Change How You See</h2>
          <p className="text-text-mid text-[0.95rem] mb-8 max-w-[600px]">The right words at the right moment can shift a perspective permanently. These have stood the test of centuries.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {QUOTES.map(q => (
              <div key={q.author + q.quote.slice(0, 20)} className="bg-gradient-to-br from-[#2A1A4A]/8 to-white border border-purple-200 rounded-[20px] p-6">
                <p className="font-display text-[1.05rem] font-bold text-charcoal leading-[1.6] mb-3 italic">&ldquo;{q.quote}&rdquo;</p>
                <p className="text-teal-mid text-[0.82rem] font-semibold mb-2">— {q.author}</p>
                <p className="text-[0.78rem] text-text-xlight italic border-t border-purple-100 pt-3">{q.context}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Frameworks */}
        <section>
          <h2 className="font-display text-[1.7rem] font-bold text-charcoal mb-2">Coaching Frameworks</h2>
          <p className="text-text-mid text-[0.95rem] mb-8 max-w-[600px]">These proven frameworks help you assess, reflect, and redesign your life with clarity and intention.</p>
          <div className="space-y-5">
            {FRAMEWORKS.map(f => (
              <div key={f.name} className={`${f.color} border rounded-[20px] p-7`}>
                <div className="flex items-start gap-4 mb-5">
                  <span className="text-[2.2rem] flex-shrink-0">{f.icon}</span>
                  <div>
                    <h3 className="font-bold text-charcoal text-[1.1rem] mb-1">{f.name}</h3>
                    <p className="text-[0.88rem] text-text-mid leading-[1.7]">{f.desc}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {f.areas.map(a => (
                    <span key={a} className="bg-white border border-current/20 text-charcoal text-[0.78rem] font-medium px-3 py-1.5 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Daily practices */}
        <section>
          <h2 className="font-display text-[1.7rem] font-bold text-charcoal mb-2">Daily Wisdom Practices</h2>
          <p className="text-text-mid text-[0.95rem] mb-8 max-w-[600px]">Wisdom is not a destination — it is a daily practice. These micro-rituals integrate coaching into your everyday life.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {DAILY_PRACTICES.map(d => (
              <div key={d.practice} className="bg-white border border-teal-light rounded-[20px] p-6 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[0.78rem] font-bold text-teal-deep bg-teal-ghost px-3 py-1 rounded-full">{d.time}</span>
                  <span className="text-[0.72rem] text-text-xlight">⏱ {d.duration}</span>
                </div>
                <h3 className="font-bold text-charcoal text-[1rem] mb-2">{d.practice}</h3>
                <p className="text-[0.87rem] text-text-mid leading-[1.7]">{d.how}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#2A1A4A] to-teal-dark rounded-[28px] p-10 text-white text-center">
          <p className="text-[2.5rem] mb-3">👴</p>
          <h2 className="font-display text-[1.6rem] font-bold mb-3">Begin your wisdom practice today</h2>
          <p className="text-white/70 text-[0.95rem] max-w-md mx-auto mb-6">
            Start with 5 minutes of morning journaling. That single habit, done daily, will transform how you see yourself and your life within 30 days.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/journal" className="bg-amber text-charcoal px-6 py-3 rounded-full font-bold text-[0.9rem] no-underline hover:bg-amber-soft transition-colors">
              Open Journal →
            </Link>
            <Link href="/coach" className="border border-white/30 text-white px-6 py-3 rounded-full font-semibold text-[0.9rem] no-underline hover:bg-white/10 transition-colors">
              Talk to Calm Coach
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
