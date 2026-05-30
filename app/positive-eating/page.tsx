import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Positive Eating — Food, Mood & Mental Wellness',
  description: 'Discover how food affects your mind and mood. Science-backed nutrition for mental wellness, energy, and emotional balance.',
}

const PRINCIPLES = [
  {
    icon: '🧠', title: 'The Gut-Brain Axis',
    text: 'Your gut produces 95% of your serotonin — the "feel-good" neurotransmitter. A healthy gut microbiome directly influences mood, anxiety, and mental clarity.',
    color: 'bg-teal-ghost border-teal-light',
  },
  {
    icon: '⚡', title: 'Blood Sugar & Mood',
    text: 'Blood sugar spikes and crashes drive irritability, anxiety, and fatigue. Eating balanced meals with fibre, protein, and healthy fats keeps mood stable throughout the day.',
    color: 'bg-amber/10 border-amber/30',
  },
  {
    icon: '🔥', title: 'Inflammation & Depression',
    text: 'Chronic inflammation is strongly linked to depression and anxiety. An anti-inflammatory diet rich in omega-3s, vegetables, and whole foods can reduce symptoms significantly.',
    color: 'bg-red-50 border-red-200',
  },
  {
    icon: '💤', title: 'Sleep & Nutrition',
    text: 'Tryptophan (found in turkey, eggs, seeds) is a precursor to melatonin. Magnesium-rich foods (leafy greens, nuts) support deep, restorative sleep.',
    color: 'bg-purple-50 border-purple-200',
  },
]

const MOOD_FOODS = [
  {
    mood: '😊 Boost Happiness',
    foods: ['Dark chocolate (70%+)', 'Bananas', 'Eggs', 'Salmon', 'Fermented foods (kefir, kimchi)', 'Walnuts'],
    why: 'Rich in tryptophan, omega-3s, and probiotics that support serotonin and dopamine production.',
    color: 'from-amber/15 to-white border-amber/30',
  },
  {
    mood: '😌 Reduce Anxiety',
    foods: ['Blueberries', 'Chamomile tea', 'Avocado', 'Almonds', 'Turmeric', 'Leafy greens'],
    why: 'High in antioxidants, magnesium, and anti-inflammatory compounds that calm the nervous system.',
    color: 'from-teal-ghost to-white border-teal-light',
  },
  {
    mood: '🧠 Sharpen Focus',
    foods: ['Oily fish (salmon, mackerel)', 'Blueberries', 'Broccoli', 'Pumpkin seeds', 'Green tea', 'Eggs'],
    why: 'Packed with DHA, choline, and antioxidants that protect brain cells and support cognitive function.',
    color: 'from-blue-50 to-white border-blue-200',
  },
  {
    mood: '⚡ Sustain Energy',
    foods: ['Oats', 'Sweet potato', 'Lentils', 'Brown rice', 'Chickpeas', 'Quinoa'],
    why: 'Complex carbohydrates release energy slowly, keeping blood sugar stable and energy consistent.',
    color: 'from-green-50 to-white border-green-200',
  },
]

const MEAL_PLANS = [
  {
    time: '🌅 Breakfast',
    title: 'Brain-Boosting Start',
    meal: 'Overnight oats with blueberries, chia seeds, walnuts, and a drizzle of honey',
    why: 'Slow-release carbs + omega-3s + antioxidants = sustained focus and stable mood all morning.',
    prep: '5 min (night before)',
  },
  {
    time: '☀️ Lunch',
    title: 'Anti-Inflammatory Bowl',
    meal: 'Grilled salmon or tofu over quinoa, with spinach, avocado, cucumber, and lemon-tahini dressing',
    why: 'Omega-3s reduce brain inflammation; quinoa provides all essential amino acids for neurotransmitter production.',
    prep: '20 min',
  },
  {
    time: '🌙 Dinner',
    title: 'Calming Evening Plate',
    meal: 'Baked sweet potato with lentil curry, steamed broccoli, and kefir yoghurt',
    why: 'Tryptophan in lentils + magnesium in broccoli + probiotics in kefir prepare the body and mind for restful sleep.',
    prep: '30 min',
  },
  {
    time: '🍎 Snacks',
    title: 'Mood-Steady Bites',
    meal: 'Apple slices with almond butter · A square of dark chocolate · A small handful of mixed nuts',
    why: 'Prevents energy crashes between meals — the #1 trigger for irritability and anxious thinking.',
    prep: '2 min',
  },
]

const AVOID = [
  { food: 'Ultra-processed foods', why: 'High in trans fats and sugar — strongly linked to depression and cognitive decline.' },
  { food: 'Refined sugar', why: 'Causes blood sugar spikes and crashes, leading to mood swings, irritability, and anxiety.' },
  { food: 'Alcohol', why: 'A central nervous system depressant that disrupts sleep, depletes serotonin, and worsens anxiety.' },
  { food: 'Excessive caffeine', why: 'More than 2–3 cups per day elevates cortisol and worsens anxiety and insomnia.' },
]

export default function PositiveEatingPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-green-700 to-teal-deep py-20 px-[5%] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
            <span className="w-6 h-0.5 bg-amber rounded" /> Wellness · Nutrition
          </div>
          <h1 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-snug mb-4">
            Eat for your mind. <em className="italic text-amber-soft">Feel the difference.</em>
          </h1>
          <p className="text-white/75 text-[1.05rem] leading-[1.8] max-w-[580px]">
            Food is not just fuel for your body — it is medicine for your mind. The right nutrition can lift your mood, sharpen your focus, ease anxiety, and help you sleep deeply.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-[5%] py-14 space-y-16">

        {/* Hero image */}
        <div className="relative h-[300px] sm:h-[420px] rounded-[28px] overflow-hidden shadow-lift">
          <Image
            src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Healthy colourful meal"
            fill className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/50 to-transparent" />
          <div className="absolute bottom-8 left-8">
            <p className="text-white font-display text-[1.4rem] font-bold">You are what you eat — and how you think.</p>
          </div>
        </div>

        {/* Core principles */}
        <section>
          <h2 className="font-display text-[1.7rem] font-bold text-charcoal mb-2">The Science of Food & Mood</h2>
          <p className="text-text-mid text-[0.95rem] mb-8 max-w-[600px]">Understanding why certain foods make you feel better is the first step to eating with intention.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PRINCIPLES.map(p => (
              <div key={p.title} className={`${p.color} border rounded-[20px] p-6`}>
                <span className="text-[2rem] block mb-3">{p.icon}</span>
                <h3 className="font-bold text-charcoal text-[1rem] mb-2">{p.title}</h3>
                <p className="text-text-mid text-[0.88rem] leading-[1.75]">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mood foods */}
        <section>
          <h2 className="font-display text-[1.7rem] font-bold text-charcoal mb-2">Eat for Your Mood</h2>
          <p className="text-text-mid text-[0.95rem] mb-8 max-w-[600px]">Different foods support different emotional and cognitive states. Here&apos;s your cheat sheet.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {MOOD_FOODS.map(m => (
              <div key={m.mood} className={`bg-gradient-to-br ${m.color} border rounded-[20px] p-6`}>
                <h3 className="font-bold text-charcoal text-[1rem] mb-3">{m.mood}</h3>
                <ul className="space-y-1.5 mb-4">
                  {m.foods.map(f => (
                    <li key={f} className="flex items-center gap-2 text-[0.87rem] text-text-mid">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-mid flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <p className="text-[0.78rem] text-text-xlight italic border-t border-current/10 pt-3">{m.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Meal plans */}
        <section>
          <h2 className="font-display text-[1.7rem] font-bold text-charcoal mb-2">A Day of Positive Eating</h2>
          <p className="text-text-mid text-[0.95rem] mb-8 max-w-[600px]">Simple, realistic meals that nourish your brain and lift your mood — no complicated recipes required.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {MEAL_PLANS.map(m => (
              <div key={m.time} className="bg-white border border-teal-light rounded-[20px] p-6 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[0.78rem] font-bold text-teal-deep bg-teal-ghost px-3 py-1 rounded-full">{m.time}</span>
                  <span className="text-[0.72rem] text-text-xlight">⏱ {m.prep}</span>
                </div>
                <h3 className="font-bold text-charcoal text-[1rem] mb-2">{m.title}</h3>
                <p className="text-[0.9rem] text-charcoal font-medium mb-3 leading-[1.6]">{m.meal}</p>
                <p className="text-[0.78rem] text-text-xlight italic">{m.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Foods to reduce */}
        <section>
          <h2 className="font-display text-[1.7rem] font-bold text-charcoal mb-2">Foods to Reduce</h2>
          <p className="text-text-mid text-[0.95rem] mb-8 max-w-[600px]">These foods are not your enemy — but reducing them can make a dramatic difference to your mental health.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AVOID.map(a => (
              <div key={a.food} className="flex gap-4 bg-red-50 border border-red-200 rounded-[16px] p-5">
                <span className="text-[1.4rem] flex-shrink-0">⚠️</span>
                <div>
                  <p className="font-bold text-charcoal text-[0.93rem] mb-1">{a.food}</p>
                  <p className="text-[0.82rem] text-text-mid leading-[1.65]">{a.why}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-green-700 to-teal-deep rounded-[28px] p-10 text-white text-center">
          <p className="text-[2.5rem] mb-3">🥗</p>
          <h2 className="font-display text-[1.6rem] font-bold mb-3">Start with one change today</h2>
          <p className="text-white/70 text-[0.95rem] max-w-md mx-auto mb-6">
            You don&apos;t need a complete overhaul. Add one mood-boosting food to your next meal and notice how you feel.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/journal" className="bg-amber text-charcoal px-6 py-3 rounded-full font-bold text-[0.9rem] no-underline hover:bg-amber-soft transition-colors">
              Track in Journal →
            </Link>
            <Link href="/mood" className="border border-white/30 text-white px-6 py-3 rounded-full font-semibold text-[0.9rem] no-underline hover:bg-white/10 transition-colors">
              Log Your Mood
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
