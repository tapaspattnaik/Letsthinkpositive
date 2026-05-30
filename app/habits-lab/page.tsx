import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Habits Lab — The Science of Building Better Habits',
  description: 'Learn the science behind habit formation, habit stacking, and atomic habits. Build routines that last.',
}

const HABIT_LOOP = [
  { step: '1', name: 'Cue', icon: '🔔', desc: 'A trigger that initiates the habit — a time, place, emotion, or preceding action.', example: 'Alarm goes off at 7am' },
  { step: '2', name: 'Craving', icon: '💭', desc: 'The motivational force — you crave the feeling the reward will bring, not the habit itself.', example: 'You want to feel alert and energised' },
  { step: '3', name: 'Routine', icon: '🔄', desc: 'The behaviour itself — physical, mental, or emotional action you take.', example: 'You brew coffee and meditate for 5 minutes' },
  { step: '4', name: 'Reward', icon: '⭐', desc: 'The benefit you gain — satisfies the craving and teaches the brain to repeat the loop.', example: 'You feel calm, clear, and ready' },
]

const LAWS = [
  { law: '1st Law', title: 'Make it Obvious', icon: '👀', color: 'from-amber/15 to-white border-amber/30', tips: ['Put your running shoes by the bed', 'Set out your journal every evening', 'Leave fruit on the counter, not hidden away'] },
  { law: '2nd Law', title: 'Make it Attractive', icon: '✨', color: 'from-teal-ghost to-white border-teal-light', tips: ['Pair habits with something you enjoy', 'Join a group where the habit is the norm', 'Create a motivating ritual before your habit'] },
  { law: '3rd Law', title: 'Make it Easy', icon: '🟢', color: 'from-green-50 to-white border-green-200', tips: ['Start with 2 minutes — never less', 'Reduce friction: fewer steps = more likely', 'Prepare your environment in advance'] },
  { law: '4th Law', title: 'Make it Satisfying', icon: '🏆', color: 'from-purple-50 to-white border-purple-200', tips: ['Track your habits visually', 'Never miss twice in a row', 'Give yourself immediate rewards after completing'] },
]

const STACKS = [
  { trigger: 'After I pour my morning coffee', habit: 'I will journal for 5 minutes', category: 'Mindset' },
  { trigger: 'After I sit down at my desk', habit: 'I will write my 3 intentions for the day', category: 'Productivity' },
  { trigger: 'After I close my laptop', habit: 'I will take a 10-minute walk', category: 'Movement' },
  { trigger: 'After I brush my teeth at night', habit: 'I will read for 15 minutes (no phone)', category: 'Rest' },
  { trigger: 'After I feel anxious', habit: 'I will take 5 deep breaths before responding', category: 'Wellness' },
  { trigger: 'After I eat lunch', habit: 'I will do 10 minutes of stretching or yoga', category: 'Movement' },
]

const TIMELINES = [
  { days: '1–7', title: 'Foundation', desc: 'The habit feels effortful and requires conscious choice. Motivation is high — use it to set up systems, not rely on willpower.' },
  { days: '8–21', title: 'Struggle', desc: 'Motivation dips, life gets in the way. This is the critical window. Focus on not breaking the chain — even tiny actions count.' },
  { days: '22–66', title: 'Automation', desc: 'The behaviour begins to feel automatic. The cue triggers the routine without deliberate thought. Keep reinforcing rewards.' },
  { days: '66+', title: 'Identity', desc: 'You don\'t have to do the habit — you ARE the person who does it. "I am a runner" beats "I run" every time.' },
]

export default function HabitsLabPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-charcoal to-teal-dark py-20 px-[5%] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
            <span className="w-6 h-0.5 bg-amber rounded" /> Wellness · Habits
          </div>
          <h1 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-snug mb-4">
            Habits Lab — <em className="italic text-amber-soft">small changes. compound results.</em>
          </h1>
          <p className="text-white/75 text-[1.05rem] leading-[1.8] max-w-[580px] mb-6">
            You don&apos;t rise to the level of your goals — you fall to the level of your systems. Learn the science of habit formation and build routines that actually last.
          </p>
          <div className="flex flex-wrap gap-6">
            {[{ n: '66', l: 'avg days to form a habit' }, { n: '40%', l: 'of daily actions are habits' }, { n: '1%', l: 'better each day = 37× better in a year' }].map(s => (
              <div key={s.l} className="text-center">
                <p className="font-display text-[1.8rem] font-bold text-amber">{s.n}</p>
                <p className="text-white/60 text-[0.75rem] max-w-[100px] leading-snug">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-[5%] py-14 space-y-16">

        {/* The Habit Loop */}
        <section>
          <h2 className="font-display text-[1.7rem] font-bold text-charcoal mb-2">The Habit Loop</h2>
          <p className="text-text-mid text-[0.95rem] mb-8 max-w-[600px]">Every habit — good or bad — follows the same four-step neurological pattern. Understanding it is the key to changing anything.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HABIT_LOOP.map(h => (
              <div key={h.step} className="bg-white border border-teal-light rounded-[20px] p-6 shadow-card relative overflow-hidden">
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-teal-ghost flex items-center justify-center text-[0.78rem] font-bold text-teal-deep">{h.step}</div>
                <span className="text-[2rem] block mb-3">{h.icon}</span>
                <h3 className="font-bold text-charcoal text-[1.05rem] mb-2">{h.name}</h3>
                <p className="text-[0.85rem] text-text-mid leading-[1.7] mb-4">{h.desc}</p>
                <div className="bg-teal-ghost rounded-[10px] px-3 py-2">
                  <p className="text-[0.75rem] text-teal-deep font-medium italic">&ldquo;{h.example}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4 Laws */}
        <section>
          <h2 className="font-display text-[1.7rem] font-bold text-charcoal mb-2">The 4 Laws of Behaviour Change</h2>
          <p className="text-text-mid text-[0.95rem] mb-8 max-w-[600px]">From James Clear&apos;s <em>Atomic Habits</em> — the framework for making good habits inevitable and bad habits impossible.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {LAWS.map(l => (
              <div key={l.law} className={`bg-gradient-to-br ${l.color} border rounded-[20px] p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[1.8rem]">{l.icon}</span>
                  <div>
                    <p className="text-[0.72rem] font-bold text-text-xlight uppercase tracking-widest">{l.law}</p>
                    <h3 className="font-bold text-charcoal text-[1.05rem]">{l.title}</h3>
                  </div>
                </div>
                <ul className="space-y-2">
                  {l.tips.map(t => (
                    <li key={t} className="flex items-start gap-2 text-[0.87rem] text-text-mid">
                      <span className="text-teal-mid mt-0.5 flex-shrink-0">✓</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Habit Stacking */}
        <section>
          <h2 className="font-display text-[1.7rem] font-bold text-charcoal mb-2">Habit Stacking</h2>
          <p className="text-text-mid text-[0.95rem] mb-2 max-w-[600px]">The most reliable way to build a new habit is to attach it to an existing one. Use the formula:</p>
          <div className="bg-teal-deep text-white rounded-[16px] px-6 py-4 inline-block mb-8">
            <p className="font-display text-[1.1rem] font-bold">&ldquo;After I [CURRENT HABIT], I will [NEW HABIT].&rdquo;</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STACKS.map(s => (
              <div key={s.habit} className="bg-white border border-teal-light rounded-[16px] p-5 shadow-card">
                <span className="text-[0.68rem] font-bold text-teal-mid bg-teal-ghost px-2 py-1 rounded-full uppercase tracking-wider">{s.category}</span>
                <p className="text-[0.8rem] text-text-xlight mt-3 mb-1">Trigger:</p>
                <p className="text-[0.88rem] text-charcoal font-medium mb-2">{s.trigger}</p>
                <p className="text-[0.8rem] text-text-xlight mb-1">New habit:</p>
                <p className="text-[0.88rem] text-teal-deep font-semibold">{s.habit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="font-display text-[1.7rem] font-bold text-charcoal mb-2">The Habit Timeline</h2>
          <p className="text-text-mid text-[0.95rem] mb-8 max-w-[600px]">A habit takes an average of 66 days to become automatic — not 21. Here&apos;s what to expect at each stage.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TIMELINES.map((t, i) => (
              <div key={t.days} className="bg-white border border-teal-light rounded-[20px] p-6 shadow-card">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-mid to-teal-deep flex items-center justify-center text-white font-bold text-[0.8rem] mb-3">{i + 1}</div>
                <p className="text-amber font-bold text-[0.78rem] mb-1">Days {t.days}</p>
                <h3 className="font-bold text-charcoal text-[1rem] mb-2">{t.title}</h3>
                <p className="text-[0.83rem] text-text-mid leading-[1.7]">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-charcoal to-teal-dark rounded-[28px] p-10 text-white text-center">
          <p className="text-[2.5rem] mb-3">⚡</p>
          <h2 className="font-display text-[1.6rem] font-bold mb-3">Ready to build your first habit?</h2>
          <p className="text-white/70 text-[0.95rem] max-w-md mx-auto mb-6">
            Start with just one habit. Use our Habit Tracker to stay accountable and build your streak.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/habits" className="bg-amber text-charcoal px-6 py-3 rounded-full font-bold text-[0.9rem] no-underline hover:bg-amber-soft transition-colors">
              Open Habit Tracker →
            </Link>
            <Link href="/challenges" className="border border-white/30 text-white px-6 py-3 rounded-full font-semibold text-[0.9rem] no-underline hover:bg-white/10 transition-colors">
              Try a Challenge
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
