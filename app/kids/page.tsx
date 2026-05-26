import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kids Zone — Calm & Kindness Activities',
  description: 'Fun, gentle activities to help children aged 5–12 practice calm, kindness, and gratitude. Simple techniques for little learners.',
}

const activities = [
  {
    id: 1,
    icon: '🫁',
    title: 'Calm Breathing for Little Learners',
    description: 'Learn a simple breathing technique to help you feel calm and happy. We breathe in like we\'re smelling our favourite flowers, and breathe out like we\'re blowing bubbles!',
    ageRange: '5–8 years',
    focus: 'Calm',
    duration: '3 minutes',
    steps: [
      'Sit comfortably and close your eyes softly 👀',
      'Breathe in through your nose for 4 counts — smell imaginary flowers 🌸',
      'Hold for 2 counts — keep those flowers close!',
      'Breathe out for 4 counts — blow gentle bubbles 🫧',
      'Do this 5 times and notice how calm you feel',
    ],
    caregiverNote: 'Encourage your child to practise this technique anytime they feel overwhelmed — before school, after a difficult moment, or at bedtime.',
    color: 'from-teal-ghost to-white',
    border: 'border-teal-light',
  },
  {
    id: 2,
    icon: '🌟',
    title: 'The Kindness Star',
    description: 'Draw a star and on each point write one kind thing you did today. Being kind to others — and to yourself — makes your star shine brighter!',
    ageRange: '6–10 years',
    focus: 'Kindness',
    duration: '5 minutes',
    steps: [
      'Get a piece of paper and draw a big star ⭐',
      'On each of the 5 points, write one kind thing you did today',
      'It could be small: sharing, listening, smiling at someone',
      'Being kind to yourself counts too — write it down!',
      'Put your Kindness Star somewhere you can see it',
    ],
    caregiverNote: 'Celebrate every entry — no act of kindness is too small. Ask your child to share their star at dinner. It creates a positive conversation ritual.',
    color: 'from-amber/15 to-white',
    border: 'border-amber/30',
  },
  {
    id: 3,
    icon: '💛',
    title: 'My Gratitude Jar',
    description: 'Every day, write one thing that made you smile and drop it in a jar. On hard days, pull out a note and remember all the good things in your world.',
    ageRange: '7–12 years',
    focus: 'Gratitude',
    duration: '2 minutes daily',
    steps: [
      'Find a jar or box — decorate it however you like 🎨',
      'Every evening, write one good thing from your day on a slip of paper',
      'It could be something that made you laugh, something tasty, or someone kind',
      'Fold it up and drop it in your jar',
      'When you feel sad, open your jar and read your notes',
    ],
    caregiverNote: 'Make this a family activity — everyone adds a slip. After one month, read them all together. It\'s a beautiful reminder of everyday joy.',
    color: 'from-teal-ghost to-white',
    border: 'border-teal-light',
  },
  {
    id: 4,
    icon: '🌈',
    title: 'Feelings Rainbow',
    description: 'Colour a rainbow and name one feeling for each colour. Learning to name your feelings helps them feel less scary — and it\'s really fun to make art!',
    ageRange: '5–9 years',
    focus: 'Emotional Awareness',
    duration: '10 minutes',
    steps: [
      'Draw a big rainbow with 6 arches 🖍️',
      'Colour each arch a different colour',
      'Write a feeling word next to each colour: Happy, Excited, Calm, Sad, Worried, Angry',
      'Point to the colour that shows how you feel right now',
      'Tell a grown-up about your colour — they want to know!',
    ],
    caregiverNote: 'Revisit the Feelings Rainbow throughout the day. Helping children name emotions builds emotional intelligence and reduces behavioural outbursts.',
    color: 'from-amber/10 to-white',
    border: 'border-amber/20',
  },
  {
    id: 5,
    icon: '🐢',
    title: 'Slow Down Like a Tortoise',
    description: 'When you feel upset or angry, be like a tortoise — slow down, pull into your shell, and take 3 deep breaths before you act. Tortoises are very wise!',
    ageRange: '5–8 years',
    focus: 'Calm',
    duration: '1 minute',
    steps: [
      'When you feel angry or overwhelmed, stop — like a tortoise! 🐢',
      'Wrap your arms around yourself — you\'re in your shell',
      'Take 3 slow deep breaths',
      'Think: "What do I need right now?"',
      'Come out of your shell when you feel ready',
    ],
    caregiverNote: 'Practice the tortoise technique when your child is calm, not in the middle of a meltdown. Role-play it as a game. This builds muscle memory for emotional regulation.',
    color: 'from-teal-ghost to-white',
    border: 'border-teal-light',
  },
  {
    id: 6,
    icon: '🌙',
    title: 'Sweet Dreams Bedtime Ritual',
    description: 'End every day by thinking of 3 good things that happened. Then send a kind thought to someone you love. Good dreams start with good thoughts!',
    ageRange: '5–12 years',
    focus: 'Gratitude · Sleep',
    duration: '5 minutes',
    steps: [
      'Lie down comfortably and close your eyes 🌙',
      'Think of 3 things from today that made you feel good',
      'Say thank you in your heart for each one',
      'Think of someone you love and send them a kind thought — imagine them smiling',
      'Take 3 slow breaths and let yourself drift off to sleep 💤',
    ],
    caregiverNote: 'This ritual reduces cortisol before sleep and builds a positive association with bedtime. Do it together for the first few nights to help your child learn the routine.',
    color: 'from-[#1A2B4A]/10 to-white',
    border: 'border-[#1A2B4A]/15',
  },
]

const FOCUS_COLORS: Record<string, string> = {
  Calm: 'bg-teal-ghost text-teal-deep',
  Kindness: 'bg-amber/15 text-amber',
  Gratitude: 'bg-green-50 text-green-700',
  'Emotional Awareness': 'bg-purple-50 text-purple-700',
  'Gratitude · Sleep': 'bg-teal-ghost text-teal-deep',
}

export default function KidsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber/30 via-amber/10 to-teal-ghost py-20 px-[5%]">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-[4rem] mb-4">🌈</div>
          <div className="text-teal-mid text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">Kids Zone</div>
          <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-bold text-charcoal leading-snug mb-4">
            Fun activities for <em className="italic text-teal-deep">little learners</em>
          </h1>
          <p className="text-text-mid text-[1.05rem] leading-[1.8] max-w-[540px] mx-auto mb-6">
            Simple, playful activities to help children aged 5–12 build calm, kindness, and gratitude — one smile at a time.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {['Calm 🧘', 'Kindness 💛', 'Gratitude 🌟', 'Feelings 🎨'].map(tag => (
              <span key={tag} className="px-4 py-1.5 bg-white border border-teal-light rounded-full text-[0.82rem] text-teal-deep font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Activities */}
      <div className="max-w-6xl mx-auto py-14 px-[5%]">
        <div className="text-center mb-10">
          <h2 className="font-display text-[1.4rem] text-charcoal font-semibold mb-2">
            Try One Today — <em className="italic text-teal-deep">Let&apos;s Breathe!</em>
          </h2>
          <p className="text-text-light text-[0.95rem]">Each activity takes 1–10 minutes and can be done anywhere.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map(a => (
            <div key={a.id}
              className={`bg-gradient-to-br ${a.color} border ${a.border} rounded-[28px] p-8 flex flex-col hover:-translate-y-1 hover:shadow-lift transition-all`}>
              <span className="text-[3rem] mb-3 block">{a.icon}</span>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[0.68rem] font-bold px-2.5 py-1 rounded-full ${FOCUS_COLORS[a.focus] ?? 'bg-teal-ghost text-teal-deep'}`}>
                  {a.focus}
                </span>
                <span className="text-text-xlight text-[0.7rem]">Ages {a.ageRange} · {a.duration}</span>
              </div>
              <h3 className="font-body font-bold text-[1.1rem] text-charcoal mb-2">{a.title}</h3>
              <p className="text-text-mid text-[0.9rem] leading-[1.7] mb-5">{a.description}</p>

              {/* Steps */}
              <div className="bg-white/60 rounded-[16px] p-5 mb-5">
                <p className="text-[0.75rem] font-bold text-teal-deep uppercase tracking-wider mb-3">How to do it:</p>
                <ol className="list-none space-y-2">
                  {a.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-[0.85rem] text-text-mid leading-[1.6]">
                      <span className="w-5 h-5 rounded-full bg-teal-ghost text-teal-deep text-[0.7rem] font-bold flex-shrink-0 flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Caregiver note */}
              <div className="mt-auto bg-amber-pale border border-amber/20 rounded-[12px] p-4">
                <p className="text-[0.72rem] font-bold text-amber uppercase tracking-wider mb-1">👨‍👩‍👧 For Caregivers</p>
                <p className="text-[0.82rem] text-text-mid leading-[1.6]">{a.caregiverNote}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-teal-ghost border border-teal-light rounded-[24px] py-12 px-8">
          <div className="text-[3rem] mb-3">🌱</div>
          <h2 className="font-display text-[1.4rem] text-charcoal font-semibold mb-3">
            Wellbeing starts young.
          </h2>
          <p className="text-text-light text-[0.95rem] max-w-[480px] mx-auto leading-[1.8]">
            The habits we build in childhood stay with us for life. Every moment you spend on these activities is an investment in a healthier, happier future for your child.
          </p>
        </div>
      </div>
    </>
  )
}
