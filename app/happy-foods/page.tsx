import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Foods That Make You Happy — Science of Joy on a Plate',
  description: 'Discover the science-backed foods that boost serotonin, dopamine, and endorphins — and learn how to eat your way to genuine happiness.',
}

const HAPPINESS_CHEMICALS = [
  {
    name: 'Serotonin',
    emoji: '😊',
    role: 'The mood stabiliser — regulates happiness, calm, and emotional wellbeing. 95% is made in your gut.',
    foods: ['Eggs', 'Salmon', 'Turkey', 'Tofu', 'Pineapple', 'Nuts & seeds', 'Bananas', 'Fermented foods'],
    why: 'These foods are rich in tryptophan — the amino acid your body converts into serotonin.',
    color: 'from-amber/15 to-amber/5',
    border: 'border-amber/30',
    badge: 'bg-amber/20 text-amber',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=700',
  },
  {
    name: 'Dopamine',
    emoji: '⚡',
    role: 'The reward chemical — drives motivation, pleasure, focus, and the joy of achievement.',
    foods: ['Dark chocolate', 'Avocados', 'Almonds', 'Chicken', 'Lentils', 'Blueberries', 'Green tea', 'Watermelon'],
    why: 'Rich in tyrosine and phenylalanine — precursors your brain converts directly into dopamine.',
    color: 'from-purple-50 to-white',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    image: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=700',
  },
  {
    name: 'Endorphins',
    emoji: '🌟',
    role: 'Natural painkillers — released during laughter, exercise, and eating certain foods. Create euphoria.',
    foods: ['Dark chocolate (70%+)', 'Strawberries', 'Spicy foods (chilli)', 'Grapes', 'Oranges', 'Ginseng', 'Vanilla'],
    why: 'Chocolate triggers endorphin release. Capsaicin in chilli causes a mild endorphin rush — the same mechanism as a runner\'s high.',
    color: 'from-pink-50 to-white',
    border: 'border-pink-200',
    badge: 'bg-pink-100 text-pink-600',
    image: 'https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg?auto=compress&cs=tinysrgb&w=700',
  },
  {
    name: 'Oxytocin',
    emoji: '💛',
    role: 'The love hormone — promotes bonding, trust, and warmth. Raised by shared meals and certain foods.',
    foods: ['Dark chocolate', 'Vitamin C foods (citrus, peppers)', 'Magnesium foods (dark leafy greens)', 'Warm drinks (herbal tea)', 'Foods cooked with love'],
    why: 'Vitamin C supports oxytocin synthesis. Magnesium helps regulate the receptors that respond to oxytocin in your brain.',
    color: 'from-orange-50 to-white',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-600',
    image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=700',
  },
]

const HAPPY_FOODS_LIST = [
  {
    food: 'Dark Chocolate',
    emoji: '🍫',
    happiness: 95,
    why: 'Triggers endorphin and serotonin release, reduces cortisol, and contains phenylethylamine — the "love chemical".',
    how: 'One or two squares of 70%+ dark chocolate as an afternoon treat.',
    color: 'border-amber/40 bg-amber/5',
  },
  {
    food: 'Blueberries',
    emoji: '🫐',
    happiness: 88,
    why: 'Antioxidants protect brain cells from stress damage. Studies show they improve mood within hours of eating.',
    how: 'Add to your morning oats or yoghurt. Frozen blueberries work just as well as fresh.',
    color: 'border-purple-200 bg-purple-50',
  },
  {
    food: 'Salmon & Oily Fish',
    emoji: '🐟',
    happiness: 92,
    why: 'Omega-3 fatty acids reduce brain inflammation and are essential for serotonin receptor function.',
    how: 'Two servings per week. Tinned salmon is just as effective and far more affordable.',
    color: 'border-teal-light bg-teal-ghost',
  },
  {
    food: 'Bananas',
    emoji: '🍌',
    happiness: 82,
    why: 'Rich in tryptophan, vitamin B6, and natural sugars — a fast-acting mood lift with lasting effect.',
    how: 'A banana before exercise maximises both physical performance and mood benefits.',
    color: 'border-amber/30 bg-amber/10',
  },
  {
    food: 'Fermented Foods',
    emoji: '🥛',
    happiness: 85,
    why: 'Kefir, kimchi, yoghurt, and sauerkraut feed the gut microbiome that produces 95% of your serotonin.',
    how: 'Add a spoonful of kefir or yoghurt daily. Start small — one tablespoon builds up the right bacteria.',
    color: 'border-green-200 bg-green-50',
  },
  {
    food: 'Walnuts',
    emoji: '🥜',
    happiness: 80,
    why: 'The only nut with significant omega-3 content. Also contains polyphenols that support cognitive health.',
    how: 'A small handful as a mid-morning snack. Walnuts look like a brain for a reason.',
    color: 'border-orange-200 bg-orange-50',
  },
  {
    food: 'Turmeric',
    emoji: '🌿',
    happiness: 78,
    why: 'Curcumin crosses the blood-brain barrier and directly boosts serotonin and dopamine production.',
    how: 'Add to curries, golden milk, or smoothies. Combine with black pepper to increase absorption by 2000%.',
    color: 'border-yellow-200 bg-yellow-50',
  },
  {
    food: 'Eggs',
    emoji: '🥚',
    happiness: 86,
    why: 'Complete source of tryptophan, choline, and B vitamins — three essential ingredients for brain happiness chemistry.',
    how: 'Scrambled, poached, or boiled — eggs for breakfast sets up your mood chemistry for the whole day.',
    color: 'border-amber/30 bg-amber/10',
  },
  {
    food: 'Leafy Greens',
    emoji: '🥬',
    happiness: 83,
    why: 'Folate (in spinach, kale) is essential for serotonin synthesis. Deficiency is linked to depression.',
    how: 'One large handful per day — in a smoothie, salad, or lightly sautéed with garlic.',
    color: 'border-green-200 bg-green-50',
  },
  {
    food: 'Saffron',
    emoji: '✨',
    happiness: 91,
    why: 'Clinical studies show saffron is as effective as some antidepressants at improving mild-to-moderate depression.',
    how: 'A pinch (30mg) in rice, tea, or warm milk. Used in Ayurveda for centuries as a natural mood lifter.',
    color: 'border-amber/40 bg-amber/10',
  },
  {
    food: 'Green Tea',
    emoji: '🍵',
    happiness: 79,
    why: 'Contains L-theanine — an amino acid that increases dopamine and GABA, producing calm alertness and gentle joy.',
    how: 'Two cups daily. The L-theanine counteracts caffeine jitters, giving you focus without anxiety.',
    color: 'border-teal-light bg-teal-ghost',
  },
  {
    food: 'Pineapple',
    emoji: '🍍',
    happiness: 75,
    why: 'One of the richest fruit sources of tryptophan. Also contains bromelain which reduces brain inflammation.',
    how: 'Add to a smoothie, eat as a snack, or grill it for a caramelised, dopamine-boosting treat.',
    color: 'border-amber/30 bg-amber/10',
  },
]

const HAPPY_RECIPES = [
  {
    name: 'The Happiness Smoothie',
    emoji: '🥤',
    time: '5 min',
    ingredients: ['1 banana', '1 cup frozen blueberries', '1 tbsp almond butter', '200ml kefir or yoghurt', 'Pinch of turmeric', 'Drizzle of honey'],
    why: 'Serotonin from banana + antioxidants from blueberries + probiotics from kefir + curcumin from turmeric = brain-boosting joy in a glass.',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    name: 'Dopamine Bowl',
    emoji: '🍲',
    time: '20 min',
    ingredients: ['Grilled chicken or tofu', 'Quinoa', 'Avocado', 'Cherry tomatoes', 'Baby spinach', 'Lemon-tahini dressing', 'Handful of walnuts'],
    why: 'Every ingredient in this bowl contributes to dopamine or serotonin production. Beautiful, filling, and genuinely mood-lifting.',
    color: 'bg-teal-ghost border-teal-light',
  },
  {
    name: 'Golden Happiness Milk',
    emoji: '🥛',
    time: '5 min',
    ingredients: ['300ml warm oat or dairy milk', '½ tsp turmeric', '¼ tsp cinnamon', 'Pinch of black pepper', '1 tsp honey', 'A few saffron strands'],
    why: 'Saffron and turmeric are the two most evidence-backed foods for improving mood. This drink is calm, warm, and genuinely therapeutic before bed.',
    color: 'bg-amber/10 border-amber/30',
  },
]

export default function HappyFoodsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber to-[#e8701a] py-20 px-[5%] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 right-20 w-60 h-60 rounded-full bg-white" />
          <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full bg-amber-soft" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-3 text-white/80 text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
            <span className="w-6 h-0.5 bg-white rounded" /> Wellness · Nutrition
          </div>
          <h1 className="font-display text-[clamp(2rem,4vw,3.4rem)] font-bold leading-snug mb-4">
            😊 Foods that make you <em className="italic">genuinely happy.</em>
          </h1>
          <p className="text-white/85 text-[1.05rem] leading-[1.8] max-w-[580px] mb-8">
            Happiness is not just a state of mind — it is a chemistry. And the right foods change that chemistry in real, measurable ways. Here is the complete science of eating for joy.
          </p>
          <div className="flex flex-wrap gap-6">
            {[{ n: '4', l: 'happiness chemicals' }, { n: '12', l: 'proven happy foods' }, { n: '3', l: 'mood-boosting recipes' }].map(s => (
              <div key={s.l} className="bg-white/15 border border-white/25 rounded-[14px] px-5 py-3 text-center">
                <p className="font-display font-bold text-[1.8rem] leading-none">{s.n}</p>
                <p className="text-white/70 text-[0.72rem] mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-[5%] py-14 space-y-16">

        {/* Hero image */}
        <div className="relative h-[260px] sm:h-[360px] rounded-[28px] overflow-hidden shadow-lift">
          <Image
            src="https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Colourful happy foods"
            fill className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
          <div className="absolute bottom-7 left-8 right-8">
            <p className="text-white font-display text-[1.3rem] sm:text-[1.6rem] font-bold leading-snug">
              &ldquo;Let food be thy medicine, and medicine be thy food.&rdquo;
            </p>
            <p className="text-white/70 text-[0.85rem] mt-1">— Hippocrates, 400 BC</p>
          </div>
        </div>

        {/* The 4 happiness chemicals */}
        <section>
          <h2 className="font-display text-[1.8rem] font-bold text-charcoal mb-2">The 4 Chemicals of Happiness</h2>
          <p className="text-text-mid text-[0.95rem] mb-10 max-w-[620px]">
            Happiness is driven by four key brain chemicals. Each one can be directly influenced by what you eat.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {HAPPINESS_CHEMICALS.map((chem, idx) => (
              <div key={chem.name} className={`bg-gradient-to-br ${chem.color} border ${chem.border} rounded-[24px] overflow-hidden`}>
                {/* Photo */}
                <div className="relative h-[200px]">
                  <Image src={chem.image} alt={chem.name} fill className="object-cover" sizes="600px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5">
                    <span className={`inline-block text-[0.7rem] font-bold px-3 py-1 rounded-full ${chem.badge}`}>{chem.emoji} {chem.name}</span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-6">
                  <p className="text-charcoal font-medium text-[0.92rem] leading-[1.7] mb-4">{chem.role}</p>
                  <p className="text-[0.75rem] font-bold text-text-xlight uppercase tracking-widest mb-2">Foods that boost it</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {chem.foods.map(f => (
                      <span key={f} className="bg-white/70 border border-white text-charcoal text-[0.75rem] font-medium px-2.5 py-1 rounded-full">{f}</span>
                    ))}
                  </div>
                  <p className="text-[0.78rem] text-text-xlight italic">{chem.why}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The 12 Happy Foods */}
        <section>
          <h2 className="font-display text-[1.8rem] font-bold text-charcoal mb-2">The 12 Happiest Foods on Earth</h2>
          <p className="text-text-mid text-[0.95rem] mb-8 max-w-[620px]">
            These are the most evidence-backed, happiness-promoting foods — ranked by their mood-lifting power. Each one has been studied in clinical research.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {HAPPY_FOODS_LIST.map((item, i) => (
              <div key={item.food} className={`bg-white border-2 ${item.color} rounded-[20px] p-5 hover:-translate-y-1 hover:shadow-lift transition-all`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[2rem]">{item.emoji}</span>
                    <div>
                      <span className="text-[0.65rem] text-text-xlight font-bold">#{i + 1}</span>
                      <h3 className="font-bold text-charcoal text-[1rem] leading-none">{item.food}</h3>
                    </div>
                  </div>
                  {/* Happiness meter */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-[0.65rem] text-text-xlight">Joy score</span>
                    <p className="font-bold text-amber text-[1rem] leading-none">{item.happiness}%</p>
                  </div>
                </div>
                {/* Happiness bar */}
                <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber to-amber-soft rounded-full" style={{ width: `${item.happiness}%` }} />
                </div>
                <p className="text-[0.82rem] text-text-mid leading-[1.65] mb-3">{item.why}</p>
                <div className="bg-teal-ghost rounded-[10px] px-3 py-2">
                  <p className="text-[0.72rem] text-teal-deep font-medium">💡 {item.how}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Happy Recipes */}
        <section>
          <h2 className="font-display text-[1.8rem] font-bold text-charcoal mb-2">3 Recipes for Instant Joy</h2>
          <p className="text-text-mid text-[0.95rem] mb-8 max-w-[620px]">
            These recipes combine multiple happiness-boosting ingredients for a compounded mood effect. Simple, quick, and genuinely uplifting.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {HAPPY_RECIPES.map(r => (
              <div key={r.name} className={`${r.color} border rounded-[22px] p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[2.2rem]">{r.emoji}</span>
                  <div>
                    <h3 className="font-bold text-charcoal text-[1rem] leading-tight">{r.name}</h3>
                    <span className="text-[0.72rem] text-text-xlight">⏱ {r.time}</span>
                  </div>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {r.ingredients.map(ing => (
                    <li key={ing} className="flex items-center gap-2 text-[0.83rem] text-text-mid">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-mid flex-shrink-0" />{ing}
                    </li>
                  ))}
                </ul>
                <p className="text-[0.75rem] text-text-xlight italic border-t border-current/10 pt-3 leading-[1.65]">{r.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Fun facts */}
        <section className="bg-gradient-to-br from-amber/10 to-white border border-amber/30 rounded-[28px] p-8">
          <h2 className="font-display text-[1.6rem] font-bold text-charcoal mb-6">Did You Know? 🤔</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { fact: 'Eating with others releases more oxytocin than eating alone — the act of sharing a meal is itself a happiness booster.', icon: '👥' },
              { fact: 'Your gut has more than 100 million neurons — making it your "second brain." It communicates directly with your emotions.', icon: '🧬' },
              { fact: 'The aroma of vanilla alone can reduce anxiety by up to 63% according to studies — and it does release endorphins.', icon: '🍦' },
              { fact: 'People who eat 7+ portions of fruit and vegetables daily report significantly higher levels of life satisfaction than those who eat fewer.', icon: '🥦' },
              { fact: 'Chewing slowly increases serotonin production — rushing meals literally makes you less happy.', icon: '🍽️' },
              { fact: 'Countries with highest fish consumption (Japan, Iceland, Norway) consistently rank among the happiest nations on earth.', icon: '🌊' },
            ].map(f => (
              <div key={f.fact} className="flex gap-4 bg-white border border-amber/20 rounded-[16px] p-4">
                <span className="text-[1.5rem] flex-shrink-0">{f.icon}</span>
                <p className="text-[0.85rem] text-text-mid leading-[1.7]">{f.fact}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related links */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-teal-light" />
            <span className="text-text-xlight text-[0.72rem] font-semibold uppercase tracking-widest">Explore More</span>
            <div className="flex-1 h-px bg-teal-light" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: '/positive-eating', icon: '🥗', label: 'Positive Eating',   desc: 'Full guide to food & mental wellness',  color: 'bg-green-50 border-green-200'    },
              { href: '/mood',            icon: '📊', label: 'Mood Tracker',       desc: 'Track how food affects your mood',     color: 'bg-blue-50 border-blue-200'      },
              { href: '/habits-lab',      icon: '⚡', label: 'Habits Lab',         desc: 'Build lasting healthy eating habits',  color: 'bg-teal-ghost border-teal-light' },
              { href: '/journal',         icon: '📓', label: 'Journal',            desc: 'Write about your happy food moments', color: 'bg-teal-ghost border-teal-light' },
              { href: '/challenges',      icon: '🏆', label: 'Wellness Challenges',desc: 'Try a 30-day gratitude challenge',     color: 'bg-amber/10 border-amber/30'     },
              { href: '/yoga',            icon: '🧘', label: 'Yoga Guide',         desc: 'Move your body, lift your mood',      color: 'bg-purple-50 border-purple-200'  },
            ].map(r => (
              <Link key={r.href} href={r.href}
                className={`flex items-start gap-4 ${r.color} border rounded-[18px] p-5 no-underline hover:-translate-y-1 hover:shadow-lift transition-all group`}>
                <span className="text-[2rem] flex-shrink-0">{r.icon}</span>
                <div>
                  <p className="font-bold text-charcoal text-[0.93rem] mb-1 group-hover:text-teal-deep transition-colors">{r.label}</p>
                  <p className="text-text-xlight text-[0.78rem] leading-snug">{r.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
