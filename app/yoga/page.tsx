import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Yoga Guide — Types, Steps & Benefits',
  description: 'Explore different styles of yoga, step-by-step guides, and the proven medical benefits of a regular yoga practice.',
}

interface YogaType {
  id: string
  name: string
  sanskrit?: string
  emoji: string
  tagline: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All levels'
  duration: string
  image: string
  description: string
  steps: string[]
  benefits: { icon: string; title: string; detail: string }[]
  tip: string
  color: string
  border: string
  badge: string
}

const YOGA_TYPES: YogaType[] = [
  {
    id: 'hatha',
    name: 'Hatha Yoga',
    sanskrit: 'हठ योग',
    emoji: '🌞',
    tagline: 'The foundation of all yoga — calm, gentle, grounding.',
    difficulty: 'Beginner',
    duration: '30–60 min',
    image: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Hatha yoga is the starting point for most yoga traditions. It focuses on basic postures (asanas) and breathing (pranayama) at a gentle pace, making it ideal for beginners seeking balance, flexibility, and peace of mind.',
    steps: [
      'Begin in Mountain Pose (Tadasana) — stand tall, feet together, arms at sides.',
      'Move to Cat-Cow Pose — on all fours, alternate arching and rounding your spine with breath.',
      'Flow into Downward Dog (Adho Mukha Svanasana) — form an inverted V-shape, press heels down.',
      'Step forward to Forward Fold (Uttanasana) — hinge at hips, let head hang heavy.',
      'Rise to Warrior I (Virabhadrasana I) — lunge forward, arms overhead, gaze up.',
      'Rest in Child\'s Pose (Balasana) — kneel, sit back on heels, arms extended forward.',
      'Finish with Corpse Pose (Savasana) — lie flat, eyes closed, 5 minutes of stillness.',
    ],
    benefits: [
      { icon: '🧠', title: 'Reduces Stress', detail: 'Lowers cortisol levels and activates the parasympathetic nervous system.' },
      { icon: '🦴', title: 'Improves Flexibility', detail: 'Regular practice increases range of motion in joints and lengthens muscle tissue.' },
      { icon: '❤️', title: 'Heart Health', detail: 'Gentle movement improves circulation and reduces blood pressure over time.' },
      { icon: '😴', title: 'Better Sleep', detail: 'Evening Hatha sessions calm the mind and prepare the body for deep rest.' },
    ],
    tip: 'Practise in the morning on an empty stomach for maximum benefit.',
    color: 'from-amber/10 to-amber/5',
    border: 'border-amber/30',
    badge: 'bg-amber/15 text-amber',
  },
  {
    id: 'vinyasa',
    name: 'Vinyasa Yoga',
    sanskrit: 'विन्यास',
    emoji: '🌊',
    tagline: 'Breath-linked movement — dynamic, creative, flowing.',
    difficulty: 'Intermediate',
    duration: '45–75 min',
    image: 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Vinyasa yoga links movement with breath in a continuous, flowing sequence. No two classes are the same — it\'s creative, energising, and builds both strength and flexibility. Often called "Flow" yoga.',
    steps: [
      'Start with 3 rounds of Sun Salutation A (Surya Namaskar A) to warm the body.',
      'Flow into Plank Pose — hold for 5 breaths, engage core and glutes.',
      'Lower to Chaturanga — elbows at 90°, body parallel to the floor.',
      'Sweep into Upward Dog (Urdhva Mukha Svanasana) — hips lifted, chest open.',
      'Push back to Downward Dog and hold for 5 breaths.',
      'Step or jump to the top of the mat, rise to Standing.',
      'Link these poses continuously with inhale = expansion, exhale = contraction.',
    ],
    benefits: [
      { icon: '🔥', title: 'Burns Calories', detail: 'A vigorous session burns 400–600 calories, supporting healthy weight management.' },
      { icon: '💪', title: 'Builds Strength', detail: 'Arm balances and core work in Vinyasa develop functional whole-body strength.' },
      { icon: '🫁', title: 'Lung Capacity', detail: 'Breath-linked movement trains the lungs to become more efficient.' },
      { icon: '🧘', title: 'Mental Focus', detail: 'Following complex sequences requires full attention, quieting mental chatter.' },
    ],
    tip: 'Don\'t skip Savasana — it\'s when the body integrates the practice.',
    color: 'from-teal-ghost to-white',
    border: 'border-teal-light',
    badge: 'bg-teal-ghost text-teal-deep',
  },
  {
    id: 'yin',
    name: 'Yin Yoga',
    sanskrit: 'यिन योग',
    emoji: '🌙',
    tagline: 'Deep, still, restorative — for joints and connective tissue.',
    difficulty: 'All levels',
    duration: '45–90 min',
    image: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Yin yoga involves holding passive poses for 3–5 minutes, targeting the deep connective tissues — fascia, ligaments, and joints. It is profoundly relaxing, meditative, and complementary to more active practices.',
    steps: [
      'Begin lying in Constructive Rest — knees bent, feet flat, hands on belly.',
      'Move into Butterfly Pose — soles together, fold forward gently, hold 3–5 min.',
      'Transition to Dragon Pose (low lunge) — sink deeply into the hip flexor, 4 min each side.',
      'Roll onto back for Supine Twist — let both knees fall to one side, arms wide, 4 min each.',
      'Practise Caterpillar — seated forward fold, spine rounded, 5 minutes.',
      'End in Savasana for a minimum of 10 minutes — allow the body to absorb the practice.',
    ],
    benefits: [
      { icon: '🦷', title: 'Joint Health', detail: 'Long holds hydrate and strengthen cartilage, reducing risk of arthritis.' },
      { icon: '🌿', title: 'Fascia Release', detail: 'Targets connective tissue that no amount of dynamic stretching can reach.' },
      { icon: '🧬', title: 'Nervous System Reset', detail: 'Activates the parasympathetic "rest and digest" response, lowering anxiety.' },
      { icon: '🫀', title: 'Organ Health', detail: 'Traditional Chinese Medicine links Yin poses to specific organ meridians.' },
    ],
    tip: 'Use blankets and bolsters — comfort allows you to hold poses longer.',
    color: 'from-[#1A2B4A]/8 to-white',
    border: 'border-[#1A2B4A]/20',
    badge: 'bg-[#1A2B4A]/10 text-[#1A2B4A]',
  },
  {
    id: 'kundalini',
    name: 'Kundalini Yoga',
    sanskrit: 'कुण्डलिनी',
    emoji: '✨',
    tagline: 'Energy, breath & mantra — the yoga of awareness.',
    difficulty: 'All levels',
    duration: '60–90 min',
    image: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Kundalini yoga combines dynamic exercises (kriyas), breathwork (pranayama), chanting, and meditation to awaken dormant energy at the base of the spine. It is deeply transformative and spiritual in nature.',
    steps: [
      'Open with Tuning In — chant "Ong Namo Guru Dev Namo" 3 times to set intention.',
      'Practise Breath of Fire (Kapalabhati) — rapid rhythmic nasal breathing for 1–3 minutes.',
      'Do Spinal Flexes — seated, hands on knees, flex spine forward and back with breath.',
      'Perform Ego Eradicator — arms at 60°, fingers curled, thumbs up, Breath of Fire for 3 min.',
      'Move into a Kriya (set sequence) appropriate for your goal — e.g. stress relief or heart opening.',
      'Deep Relaxation — lie in Savasana for 11 minutes.',
      'Close with meditation and Long Sat Nam chant.',
    ],
    benefits: [
      { icon: '⚡', title: 'Energy Boost', detail: 'Kriyas activate the endocrine system, increasing vitality and reducing fatigue.' },
      { icon: '🧠', title: 'Mental Clarity', detail: 'Breathwork oxygenates the brain, improving focus, memory, and decision-making.' },
      { icon: '💙', title: 'Emotional Balance', detail: 'Regular practice regulates the nervous system and reduces symptoms of depression.' },
      { icon: '🌀', title: 'Spiritual Growth', detail: 'Awakens intuition and cultivates a deeper sense of purpose and inner knowing.' },
    ],
    tip: 'Wear white or light clothing — it is believed to expand the aura.',
    color: 'from-purple-50 to-white',
    border: 'border-purple-200',
    badge: 'bg-purple-50 text-purple-700',
  },
  {
    id: 'ashtanga',
    name: 'Ashtanga Yoga',
    sanskrit: 'अष्टांग',
    emoji: '🔥',
    tagline: 'A fixed, powerful sequence — discipline meets devotion.',
    difficulty: 'Advanced',
    duration: '60–120 min',
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Ashtanga is a rigorous, set sequence of poses practised in the same order every time. It builds heat (tapas), purifies the body through sweat, and demands commitment. The Primary Series alone takes 90 minutes.',
    steps: [
      'Sun Salutation A — 5 rounds. Sun Salutation B — 5 rounds. This is the foundation.',
      'Standing Sequence — Trikonasana, Parsvakonasana, Prasarita Padottanasana, Parsvottanasana.',
      'Primary Series seated poses — Paschimottanasana, Janu Sirsasana, Marichyasana series.',
      'Always use Ujjayi breath — a soft ocean-sound breath through the nose.',
      'Apply bandhas — Mula Bandha (root lock) and Uddiyana Bandha (abdominal lock) throughout.',
      'Fix your drishti — a specific gaze point for each pose aids concentration.',
      'Finish with closing sequence — Setu Bandhasana through Sirsasana (headstand), then Savasana.',
    ],
    benefits: [
      { icon: '💪', title: 'Full-Body Strength', detail: 'The Primary Series develops extraordinary strength, especially in core and arms.' },
      { icon: '🫀', title: 'Cardiovascular', detail: 'Continuous movement elevates heart rate — comparable to moderate cardio.' },
      { icon: '🧘', title: 'Discipline', detail: 'The fixed sequence develops mental fortitude and meditative focus.' },
      { icon: '🔥', title: 'Detoxification', detail: 'Internal heat and sweat eliminate toxins through the skin.' },
    ],
    tip: 'Practise 6 days a week; rest on moon days and Saturdays (Mysore tradition).',
    color: 'from-red-50 to-white',
    border: 'border-red-200',
    badge: 'bg-red-50 text-red-600',
  },
  {
    id: 'restorative',
    name: 'Restorative Yoga',
    sanskrit: 'पुनर्स्थापन',
    emoji: '🌸',
    tagline: 'Supported, still, deeply healing — rest as practice.',
    difficulty: 'All levels',
    duration: '45–75 min',
    image: 'https://images.pexels.com/photos/3822894/pexels-photo-3822894.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Restorative yoga uses props — bolsters, blankets, blocks, and straps — to support the body in passive poses for 5–20 minutes each. There is no muscular effort; the nervous system heals through complete surrender.',
    steps: [
      'Gather props: 2 blankets, 1 bolster or firm pillow, 2 yoga blocks.',
      'Supported Child\'s Pose — bolster under chest, 10 minutes. Let gravity do the work.',
      'Legs Up the Wall (Viparita Karani) — lie on back, legs vertical against wall, 10–15 min.',
      'Supported Reclining Butterfly — bolster under spine, blanket under knees, 10 min.',
      'Supported Bridge — block under sacrum at medium height, arms at sides, 8 min.',
      'Savasana — fully bolstered, eye pillow optional, minimum 10 minutes.',
      'Transition out slowly — never rush from a restorative pose.',
    ],
    benefits: [
      { icon: '😌', title: 'Anxiety Relief', detail: 'Activates the vagus nerve, reducing anxiety, panic, and chronic worry.' },
      { icon: '🩺', title: 'Chronic Illness', detail: 'Recommended by oncologists, cardiologists, and therapists as complementary care.' },
      { icon: '💤', title: 'Sleep Disorders', detail: 'A 20-minute restorative session before bed dramatically improves sleep quality.' },
      { icon: '🏥', title: 'Injury Recovery', detail: 'Zero load on joints makes it safe during rehabilitation from injury or surgery.' },
    ],
    tip: 'Keep a journal nearby — deep rest often surfaces emotions and insights.',
    color: 'from-pink-50 to-white',
    border: 'border-pink-200',
    badge: 'bg-pink-50 text-pink-600',
  },
]

const DIFFICULTY_COLOR: Record<string, string> = {
  'Beginner':     'bg-green-100 text-green-700',
  'Intermediate': 'bg-amber/15 text-amber',
  'Advanced':     'bg-red-100 text-red-600',
  'All levels':   'bg-teal-ghost text-teal-deep',
}

export default function YogaPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
            <span className="w-6 h-0.5 bg-amber rounded" /> Wellness · Yoga
          </div>
          <h1 className="font-display text-[clamp(2.2rem,4vw,3.4rem)] font-bold leading-snug mb-4">
            Find your flow. <em className="italic text-amber-soft">Transform your life.</em>
          </h1>
          <p className="text-white/75 text-[1.05rem] leading-[1.8] max-w-[580px] mb-8">
            Yoga is more than a workout — it&apos;s a complete system for mind, body, and spirit. Explore six transformative styles, learn the steps, and discover the science-backed benefits of each.
          </p>
          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            {[
              { n: '6',    label: 'yoga styles'           },
              { n: '300M', label: 'practitioners globally' },
              { n: '80+',  label: 'medical benefits'       },
              { n: '5000', label: 'years of tradition'     },
            ].map(({ n, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-[1.8rem] font-bold text-amber">{n}</p>
                <p className="text-white/60 text-[0.78rem]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick navigation ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-teal-light sticky top-[72px] z-40 overflow-x-auto">
        <div className="max-w-6xl mx-auto px-[5%]">
          <div className="flex gap-1 py-3 min-w-max">
            {YOGA_TYPES.map(y => (
              <a key={y.id} href={`#${y.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[0.82rem] font-semibold text-text-mid hover:bg-teal-ghost hover:text-teal-deep transition-all whitespace-nowrap no-underline">
                <span>{y.emoji}</span> {y.name.replace(' Yoga', '')}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Yoga types ───────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-[5%] py-14 space-y-20">
        {YOGA_TYPES.map((yoga, idx) => (
          <section key={yoga.id} id={yoga.id} className="scroll-mt-32">

            {/* Section header */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="text-[2.4rem]">{yoga.emoji}</span>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-display text-[1.9rem] font-bold text-charcoal">{yoga.name}</h2>
                  {yoga.sanskrit && (
                    <span className="text-[0.85rem] text-text-xlight font-normal">{yoga.sanskrit}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-[0.72rem] font-bold px-3 py-1 rounded-full ${DIFFICULTY_COLOR[yoga.difficulty]}`}>
                    {yoga.difficulty}
                  </span>
                  <span className="text-[0.78rem] text-text-xlight">⏱ {yoga.duration}</span>
                  <span className="text-[0.78rem] text-teal-mid font-medium italic">{yoga.tagline}</span>
                </div>
              </div>
            </div>

            {/* Two-col layout: image + description */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-10 ${idx % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}>

              {/* Image */}
              <div className="relative h-[300px] sm:h-[380px] rounded-[24px] overflow-hidden shadow-lift">
                <Image
                  src={yoga.image}
                  alt={yoga.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/40 to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <span className={`text-[0.72rem] font-bold px-3 py-1.5 rounded-full ${yoga.badge}`}>
                    {yoga.difficulty} · {yoga.duration}
                  </span>
                </div>
              </div>

              {/* Description + benefits */}
              <div>
                <p className="text-text-mid text-[0.97rem] leading-[1.85] mb-6">{yoga.description}</p>

                <h3 className="font-display text-[1.1rem] font-bold text-charcoal mb-4">Medical Benefits</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {yoga.benefits.map(b => (
                    <div key={b.title} className={`bg-gradient-to-br ${yoga.color} border ${yoga.border} rounded-[16px] p-4`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[1.3rem]">{b.icon}</span>
                        <p className="font-bold text-[0.88rem] text-charcoal">{b.title}</p>
                      </div>
                      <p className="text-[0.78rem] text-text-mid leading-[1.6]">{b.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step-by-step guide */}
            <div className={`bg-gradient-to-br ${yoga.color} border ${yoga.border} rounded-[24px] p-7`}>
              <h3 className="font-display text-[1.15rem] font-bold text-charcoal mb-5">
                How to Practise — Step by Step
              </h3>
              <ol className="space-y-3">
                {yoga.steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[0.78rem] font-bold ${yoga.badge}`}>
                      {i + 1}
                    </span>
                    <p className="text-[0.9rem] text-text-mid leading-[1.7] pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-5 pt-5 border-t border-current/10 flex items-start gap-3">
                <span className="text-[1.3rem] flex-shrink-0">💡</span>
                <p className="text-[0.85rem] text-text-mid italic"><strong className="text-charcoal not-italic">Pro tip:</strong> {yoga.tip}</p>
              </div>
            </div>

            {idx < YOGA_TYPES.length - 1 && (
              <div className="flex items-center gap-4 mt-16">
                <div className="flex-1 h-px bg-teal-light" />
                <span className="text-teal-light text-[1.2rem]">✦</span>
                <div className="flex-1 h-px bg-teal-light" />
              </div>
            )}
          </section>
        ))}
      </div>

      {/* ── Bottom CTA ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark text-white py-16 px-[5%]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[2.5rem] mb-4">🧘‍♀️</p>
          <h2 className="font-display text-[1.8rem] font-bold mb-3">Ready to begin?</h2>
          <p className="text-white/70 text-[0.97rem] leading-[1.8] mb-8">
            Start with 10 minutes of Hatha or Restorative yoga today. You don&apos;t need a mat, special clothes, or experience — just a quiet space and a willing mind.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/meditation"
              className="bg-amber text-charcoal px-7 py-3.5 rounded-full font-bold text-[0.95rem] no-underline hover:bg-amber-soft transition-colors">
              Try Guided Meditation →
            </Link>
            <Link href="/breathing"
              className="border border-white/30 text-white px-7 py-3.5 rounded-full font-semibold text-[0.95rem] no-underline hover:bg-white/10 transition-colors">
              Breathing Exercises
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
