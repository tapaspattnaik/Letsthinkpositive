'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// ── Test definitions ──────────────────────────────────────────────────────────
const SCALE_4 = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
const SCALE_5 = ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
const SCALE_5B = ['Not at all true', 'A little true', 'Moderately true', 'Very true', 'Completely true']

interface TestDef {
  key: string; title: string; subtitle: string; icon: string; duration: string
  description: string; color: string; textColor: string
  timeframe: string; options: string[]; questions: string[]
  reverseIdx?: number[]
  score(answers: number[]): { score: number; band: string }
  result(score: number, name: string): { heading: string; message: string; recommendations: { label: string; href: string; icon: string }[] }
}

const TESTS: TestDef[] = [
  {
    key: 'phq9', title: 'Mood Check', subtitle: 'PHQ-9 · Depression Screen',
    icon: '🌧️', duration: '2 min', color: 'from-blue-50 to-indigo-50', textColor: 'text-indigo-700',
    description: 'A gentle check on how your mood has been lately. No judgement — just honest self-awareness.',
    timeframe: 'Over the last 2 weeks, how often have you been bothered by...',
    options: SCALE_4,
    questions: [
      'Little interest or pleasure in doing things',
      'Feeling down, depressed, or hopeless',
      'Trouble falling or staying asleep, or sleeping too much',
      'Feeling tired or having little energy',
      'Poor appetite — or overeating',
      'Feeling bad about yourself, or that you are a failure',
      'Trouble concentrating on things, such as reading or watching TV',
      'Moving or speaking so slowly that other people could have noticed — or being so fidgety that you moved around more than usual',
      'Thoughts that you would be better off dead, or of hurting yourself in some way',
    ],
    score(a) {
      const s = a.reduce((t, v) => t + v, 0)
      const band = s <= 4 ? 'minimal' : s <= 9 ? 'mild' : s <= 14 ? 'moderate' : s <= 19 ? 'moderately-severe' : 'severe'
      return { score: s, band }
    },
    result(score, name) {
      if (score <= 4) return {
        heading: `You're doing well, ${name} 🌤️`,
        message: "Your mood check looks healthy right now. Life still has its ups and downs — but you're navigating them. Keep doing what you're doing, and come back whenever you want to check in.",
        recommendations: [
          { label: 'Journal your gratitude', href: '/journal', icon: '📓' },
          { label: 'Morning intention', href: '/intention', icon: '🌅' },
          { label: 'Celebrate in community', href: '/community', icon: '💛' },
        ],
      }
      if (score <= 9) return {
        heading: `Some low days lately, ${name} 🌫️`,
        message: "You've been feeling a bit flat recently — and that's completely normal. Life can be heavy sometimes. The fact you're here, checking in with yourself, already says a lot about your self-awareness. Small, gentle steps forward.",
        recommendations: [
          { label: 'Start gratitude journaling', href: '/journal', icon: '📓' },
          { label: 'Try 10-min meditation', href: '/meditation', icon: '🧘' },
          { label: 'Foods that lift mood', href: '/happy-foods', icon: '😊' },
          { label: 'Talk to Calm Coach', href: '/coach', icon: '🌿' },
        ],
      }
      if (score <= 14) return {
        heading: `Things have been hard, ${name} 💙`,
        message: "Your score suggests you've been going through a genuinely difficult period. That takes courage to acknowledge. This app is here to support you — but please also consider talking to someone you trust or a professional. You deserve real support.",
        recommendations: [
          { label: 'Breathing exercises now', href: '/breathing', icon: '🌬️' },
          { label: 'Talk to Calm Coach', href: '/coach', icon: '🌿' },
          { label: '7-day mindfulness challenge', href: '/challenges', icon: '🏆' },
          { label: 'Calm sounds', href: '/sounds', icon: '🎧' },
        ],
      }
      return {
        heading: `Please don't carry this alone, ${name} 🤗`,
        message: "Your score suggests you may be experiencing significant distress. I want you to know: what you're feeling is real, it matters, and it's treatable. Please reach out to a mental health professional or someone you trust. You are not a burden — you are worthy of care.",
        recommendations: [
          { label: 'Crisis support resources', href: '/emergency', icon: '🆘' },
          { label: 'Talk to Calm Coach', href: '/coach', icon: '🌿' },
          { label: 'Guided breathing (right now)', href: '/breathing', icon: '🌬️' },
        ],
      }
    },
  },

  {
    key: 'gad7', title: 'Anxiety Check', subtitle: 'GAD-7 · Anxiety Screen',
    icon: '⚡', duration: '2 min', color: 'from-amber/10 to-yellow-50', textColor: 'text-amber-700',
    description: 'A short check to understand how much anxiety and worry has been affecting you.',
    timeframe: 'Over the last 2 weeks, how often have you been bothered by...',
    options: SCALE_4,
    questions: [
      'Feeling nervous, anxious, or on edge',
      'Not being able to stop or control worrying',
      'Worrying too much about different things',
      'Trouble relaxing',
      'Being so restless that it is hard to sit still',
      'Becoming easily annoyed or irritable',
      'Feeling afraid as if something awful might happen',
    ],
    score(a) {
      const s = a.reduce((t, v) => t + v, 0)
      const band = s <= 4 ? 'minimal' : s <= 9 ? 'mild' : s <= 14 ? 'moderate' : 'severe'
      return { score: s, band }
    },
    result(score, name) {
      if (score <= 4) return {
        heading: `Your anxiety is well-managed, ${name} ✨`,
        message: "Your results suggest anxiety isn't significantly getting in the way right now. You've found some balance. Keeping up calming practices will help maintain this.",
        recommendations: [
          { label: 'Box breathing practice', href: '/breathing', icon: '🌬️' },
          { label: 'Morning intention', href: '/intention', icon: '🌅' },
          { label: 'Calm sounds', href: '/sounds', icon: '🎧' },
        ],
      }
      if (score <= 9) return {
        heading: `Some anxiety present, ${name} 🌊`,
        message: "You're experiencing some anxiety that's worth paying attention to. It hasn't taken over — but it's whispering. The good news: there are very effective tools for this, and you've already found this platform.",
        recommendations: [
          { label: '4-7-8 breathing (try now)', href: '/breathing', icon: '🌬️' },
          { label: 'Thought Reframer', href: '/reframe', icon: '🧠' },
          { label: 'Calm sounds mixer', href: '/sounds', icon: '🎧' },
          { label: 'Talk to Calm Coach', href: '/coach', icon: '🌿' },
        ],
      }
      return {
        heading: `Anxiety is quite present for you right now, ${name} 💙`,
        message: "Your anxiety score is significant — and I want you to know that's not a personal failing. Anxiety is incredibly common and very treatable. You've taken the first step by understanding it. Let's work on it together.",
        recommendations: [
          { label: 'Guided breathing (now)', href: '/breathing', icon: '🌬️' },
          { label: 'Daily meditation practice', href: '/meditation', icon: '🧘' },
          { label: 'Talk to Calm Coach', href: '/coach', icon: '🌿' },
          { label: 'Wisdom coaching', href: '/wisdom-coaching', icon: '👴' },
        ],
      }
    },
  },

  {
    key: 'pss10', title: 'Stress Level', subtitle: 'PSS-10 · Stress Scale',
    icon: '🌀', duration: '3 min', color: 'from-orange-50 to-red-50', textColor: 'text-orange-700',
    description: 'Measures how unpredictable, uncontrollable, and overloaded you\'ve been feeling.',
    timeframe: 'In the last month, how often have you...',
    options: SCALE_5,
    reverseIdx: [3, 4, 6, 7],
    questions: [
      'Been upset because of something that happened unexpectedly?',
      'Felt that you were unable to control the important things in your life?',
      'Felt nervous and stressed?',
      'Felt confident about your ability to handle your personal problems?',
      'Felt that things were going your way?',
      'Found that you could not cope with all the things you had to do?',
      'Been able to control irritations in your life?',
      'Felt that you were on top of things?',
      'Been angered because of things that were outside of your control?',
      'Felt difficulties were piling up so high that you could not overcome them?',
    ],
    score(a) {
      const reversed = a.map((v, i) => [3, 4, 6, 7].includes(i) ? 4 - v : v)
      const s = reversed.reduce((t, v) => t + v, 0)
      const band = s <= 13 ? 'low' : s <= 26 ? 'moderate' : 'high'
      return { score: s, band }
    },
    result(score, name) {
      if (score <= 13) return {
        heading: `Low stress — well done, ${name} 🌿`,
        message: "You're managing the demands of life really well right now. Your sense of control is healthy. Whatever you're doing — keep doing it.",
        recommendations: [
          { label: 'Track your wellness streak', href: '/habits', icon: '🎯' },
          { label: 'Celebrate your progress', href: '/challenges', icon: '🏆' },
          { label: 'Share your story', href: '/community', icon: '💛' },
        ],
      }
      if (score <= 26) return {
        heading: `Moderate stress — manageable but worth watching, ${name} 🌬️`,
        message: "You're handling stress, but it's taking effort. Life is clearly busy and demanding. The key now is building recovery rituals into your day — not massive changes, just small anchors.",
        recommendations: [
          { label: 'Morning intention ritual', href: '/intention', icon: '🌅' },
          { label: 'Breathing exercises', href: '/breathing', icon: '🌬️' },
          { label: 'Habits Lab — build recovery routines', href: '/habits-lab', icon: '⚡' },
          { label: 'Calm sounds for focus', href: '/sounds', icon: '🎧' },
        ],
      }
      return {
        heading: `High stress — your body and mind need a break, ${name} 🤗`,
        message: "Your stress level is high enough to impact your health, sleep, and thinking. I really want you to take this seriously — not as a crisis, but as an important message from your body: you need more support and recovery than you're currently getting.",
        recommendations: [
          { label: 'Start with one breathing session', href: '/breathing', icon: '🌬️' },
          { label: 'Sleep tracker — are you resting?', href: '/sleep', icon: '🌙' },
          { label: 'Positive eating for stress', href: '/positive-eating', icon: '🥗' },
          { label: 'Talk to Calm Coach', href: '/coach', icon: '🌿' },
        ],
      }
    },
  },

  {
    key: 'compassion', title: 'Self-Compassion', subtitle: 'SCS Short Form',
    icon: '💛', duration: '3 min', color: 'from-yellow-50 to-amber/10', textColor: 'text-amber-700',
    description: 'How kind are you to yourself when things go wrong? This test reveals your inner voice.',
    timeframe: 'How I typically act towards myself in difficult times...',
    options: SCALE_5B,
    questions: [
      'I try to be understanding and patient towards those aspects of my personality I don\'t like',
      'When something upsets me I try to keep my emotions in balance',
      'When I\'m feeling down, I tend to obsess and fixate on everything that\'s wrong',
      'I try to see my failings as part of the human condition',
      'I\'m kind to myself when I\'m experiencing suffering',
      'When I\'m upset, I remind myself that there are many people in the world feeling like I do',
      'When I fail at something important to me I become consumed by feelings of inadequacy',
      'When I\'m going through a very hard time, I give myself the caring and tenderness I need',
      'When something pains me, I try to approach the feeling with openness and curiosity',
      'When I feel inadequate in some way, I try to remind myself that feelings of inadequacy are shared by most people',
      'I\'m disapproving and judgmental about my own flaws and inadequacies',
      'I\'m intolerant and impatient with those aspects of my personality I don\'t like',
    ],
    reverseIdx: [2, 6, 10, 11],
    score(a) {
      const corrected = a.map((v, i) => [2, 6, 10, 11].includes(i) ? 4 - v : v)
      const s = corrected.reduce((t, v) => t + v, 0)
      const avg = (s / 12) + 1 // 1–5 scale average
      const band = avg < 2.5 ? 'low' : avg < 3.5 ? 'moderate' : 'high'
      return { score: Math.round(avg * 20), band } // normalise to 0-100
    },
    result(score, name) {
      if (score >= 70) return {
        heading: `You treat yourself with real kindness, ${name} 💛`,
        message: "Your self-compassion is genuinely strong. You're able to hold your own pain with warmth rather than criticism — that's a rare and beautiful quality that protects your mental health enormously.",
        recommendations: [
          { label: 'Gratitude journal', href: '/journal', icon: '📓' },
          { label: 'Share your wisdom', href: '/blog/submit', icon: '✍️' },
          { label: 'Morning affirmation', href: '/affirmation', icon: '💌' },
        ],
      }
      if (score >= 40) return {
        heading: `Growing in self-compassion, ${name} 🌱`,
        message: "You have a good foundation, but there are moments when your inner critic takes over — and it can be harsh. The goal isn't to eliminate that voice but to balance it with a kinder one. You deserve the same gentleness you'd give a good friend.",
        recommendations: [
          { label: 'Daily affirmations', href: '/affirmation', icon: '💌' },
          { label: 'Wisdom Coaching', href: '/wisdom-coaching', icon: '👴' },
          { label: 'Talk to Calm Coach', href: '/coach', icon: '🌿' },
        ],
      }
      return {
        heading: `Your inner critic is working overtime, ${name} 🤗`,
        message: "Your score suggests you can be quite hard on yourself. That inner critic probably feels like it\'s helping — keeping you motivated, protecting you from failure. But research consistently shows it does the opposite. You are worthy of your own compassion. Exactly as you are, right now.",
        recommendations: [
          { label: 'Daily affirmations (start here)', href: '/affirmation', icon: '💌' },
          { label: 'Thought Reframer', href: '/reframe', icon: '🧠' },
          { label: 'Talk to Calm Coach', href: '/coach', icon: '🌿' },
          { label: 'Wisdom Coaching', href: '/wisdom-coaching', icon: '👴' },
        ],
      }
    },
  },

  {
    key: 'resilience', title: 'Resilience', subtitle: 'Brief Resilience Scale',
    icon: '🌳', duration: '2 min', color: 'from-green-50 to-teal-ghost', textColor: 'text-teal-deep',
    description: 'How well do you recover from life\'s setbacks and stressors? Resilience is a skill.',
    timeframe: 'Please indicate the extent to which you agree with each of the following statements:',
    options: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
    reverseIdx: [1, 3, 5],
    questions: [
      'I tend to bounce back quickly after hard times',
      'I have a hard time making it through stressful events',
      'It does not take me long to recover from a stressful event',
      'It is hard for me to snap back when something bad happens',
      'I usually come through difficult times with little trouble',
      'I tend to take a long time to get over setbacks in my life',
    ],
    score(a) {
      const corrected = a.map((v, i) => [1, 3, 5].includes(i) ? 4 - v : v)
      const avg = corrected.reduce((t, v) => t + v, 0) / 6
      const normalised = Math.round((avg / 4) * 100)
      const band = normalised >= 65 ? 'high' : normalised >= 40 ? 'moderate' : 'low'
      return { score: normalised, band }
    },
    result(score, name) {
      if (score >= 65) return {
        heading: `You're genuinely resilient, ${name} 🌳`,
        message: "Life knocks you down sometimes — but you get back up. Your resilience score is strong, meaning you've developed the ability to adapt and recover. That's one of the most valuable psychological assets a person can have.",
        recommendations: [
          { label: 'Keep building habits', href: '/habits', icon: '🎯' },
          { label: 'Share your story', href: '/community', icon: '💛' },
          { label: 'Mentor others in Circles', href: '/circles', icon: '🔒' },
        ],
      }
      if (score >= 40) return {
        heading: `Building resilience, ${name} 🌱`,
        message: "You have some bounce-back ability, but hard times can take a toll and recovery feels slow. The good news: resilience isn't fixed — it's built. Small, consistent practices compound into real strength.",
        recommendations: [
          { label: 'Habits Lab — build daily anchors', href: '/habits-lab', icon: '⚡' },
          { label: '21-day challenge', href: '/challenges', icon: '🏆' },
          { label: 'Morning intention', href: '/intention', icon: '🌅' },
          { label: 'Wisdom Coaching', href: '/wisdom-coaching', icon: '👴' },
        ],
      }
      return {
        heading: `Setbacks feel heavy right now, ${name} 💙`,
        message: "Recovering from difficulties feels like a real struggle at the moment. That doesn't mean you're weak — it often means you've been carrying a lot without enough support. Resilience grows when we tend to ourselves. Let's start there.",
        recommendations: [
          { label: 'Start with breathing', href: '/breathing', icon: '🌬️' },
          { label: 'Sleep tracker', href: '/sleep', icon: '🌙' },
          { label: 'Talk to Calm Coach', href: '/coach', icon: '🌿' },
          { label: '7-day mindfulness challenge', href: '/challenges', icon: '🏆' },
        ],
      }
    },
  },

  {
    key: 'perma', title: 'Wellbeing Profile', subtitle: 'PERMA Model',
    icon: '🌟', duration: '5 min', color: 'from-purple-50 to-pink-50', textColor: 'text-purple-700',
    description: 'Martin Seligman\'s gold-standard model of flourishing. See where you\'re thriving and where to grow.',
    timeframe: 'In general, to what extent do the following apply to you?',
    options: ['Not at all', 'A little', 'Somewhat', 'Mostly', 'Completely'],
    questions: [
      // Positive Emotions (P)
      'I feel joyful',
      'I feel grateful for what I have',
      'I feel positive about the future',
      // Engagement (E)
      'I become absorbed in what I am doing',
      'I pursue activities that I find engaging and interesting',
      'I am excited about my daily activities',
      // Relationships (R)
      'I feel loved',
      'I have warm and trusting relationships',
      'I feel supported by people around me',
      // Meaning (M)
      'I feel my life has a sense of direction',
      'I feel that what I do in life is valuable and worthwhile',
      'I generally feel that what I do makes a difference',
      // Accomplishment (A)
      'I achieve the important goals I set for myself',
      'I feel capable and competent',
      'I make progress on things that matter to me',
    ],
    score(a) {
      const total = a.reduce((t, v) => t + v, 0)
      const band = total >= 45 ? 'flourishing' : total >= 30 ? 'moderate' : 'low'
      return { score: Math.round((total / 60) * 100), band }
    },
    result(score, name) {
      if (score >= 75) return {
        heading: `You are flourishing, ${name} 🌟`,
        message: "Across all five pillars of wellbeing — positive emotions, engagement, relationships, meaning, and accomplishment — you're doing really well. This is what a life well-lived looks like. Protect it and share it.",
        recommendations: [
          { label: 'Start a 30-day challenge', href: '/challenges', icon: '🏆' },
          { label: 'Share your story', href: '/blog/submit', icon: '✍️' },
          { label: 'Build your tribe', href: '/tribe', icon: '🌿' },
        ],
      }
      if (score >= 50) return {
        heading: `You're doing well, with room to bloom, ${name} 🌸`,
        message: "You have solid foundations in your wellbeing — some areas are thriving, others have room to grow. The PERMA model shows flourishing isn't about being perfect in every area, but about steady progress across all of them.",
        recommendations: [
          { label: 'Meaning: Morning intention', href: '/intention', icon: '🌅' },
          { label: 'Engagement: Vision Board', href: '/vision-board', icon: '⭐' },
          { label: 'Relationships: My Tribe', href: '/tribe', icon: '🌿' },
        ],
      }
      return {
        heading: `Your wellbeing needs more nourishment, ${name} 🌱`,
        message: "Your results suggest multiple areas of your wellbeing are feeling depleted. That's okay — this is information, not judgement. You can't fill all five pillars overnight, but picking even one to focus on this week can start a powerful ripple.",
        recommendations: [
          { label: 'Relationships: Join a Circle', href: '/circles', icon: '🔒' },
          { label: 'Meaning: Wisdom Coaching', href: '/wisdom-coaching', icon: '👴' },
          { label: 'Positive Emotions: Gratitude', href: '/journal', icon: '📓' },
          { label: 'Talk to Calm Coach', href: '/coach', icon: '🌿' },
        ],
      }
    },
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

interface PrevResult { testKey: string; score: number; band: string; createdAt: string }

export default function AssessmentsPage() {
  const { data: session, status } = useSession()
  const [view,     setView]    = useState<'hub' | 'taking' | 'result'>('hub')
  const [testIdx,  setTestIdx] = useState(0)
  const [qIdx,     setQIdx]    = useState(0)
  const [answers,  setAnswers] = useState<number[]>([])
  const [latest,   setLatest]  = useState<Record<string, PrevResult>>({})
  const [saving,   setSaving]  = useState(false)
  const [result,   setResult]  = useState<{ score: number; band: string } | null>(null)

  const test = TESTS[testIdx]

  const fetchHistory = useCallback(async () => {
    if (!session?.user?.id) return
    const res = await fetch('/api/assessments')
    if (res.ok) { const d = await res.json(); setLatest(d.latest ?? {}) }
  }, [session?.user?.id])

  useEffect(() => { if (status === 'authenticated') fetchHistory() }, [status, fetchHistory])

  function startTest(idx: number) {
    setTestIdx(idx); setQIdx(0); setAnswers([]); setResult(null); setView('taking')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function selectAnswer(val: number) {
    const newAnswers = [...answers, val]
    setAnswers(newAnswers)

    if (newAnswers.length < test.questions.length) {
      setTimeout(() => setQIdx(q => q + 1), 300)
    } else {
      // Complete
      const r = test.score(newAnswers)
      setResult(r)
      setView('result')
      window.scrollTo({ top: 0, behavior: 'smooth' })

      // Save to DB
      if (session?.user?.id) {
        setSaving(true)
        await fetch('/api/assessments', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testKey: test.key, score: r.score, band: r.band, answers: newAnswers }),
        })
        await fetchHistory()
        setSaving(false)
      }
    }
  }

  const userName = session?.user?.name?.split(' ')[0] ?? 'friend'

  // ── Result view ───────────────────────────────────────────────────────────
  if (view === 'result' && result) {
    const res = test.result(result.score, userName)
    const bandColors: Record<string, string> = {
      minimal: 'text-teal-deep bg-teal-ghost', mild: 'text-amber-700 bg-amber/15',
      moderate: 'text-orange-600 bg-orange-50', 'moderately-severe': 'text-red-600 bg-red-50',
      severe: 'text-red-700 bg-red-100', low: 'text-blue-600 bg-blue-50',
      high: 'text-red-600 bg-red-50', flourishing: 'text-teal-deep bg-teal-ghost',
    }
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-ghost/50 to-ivory pt-[72px] pb-16">
        <div className="max-w-2xl mx-auto px-[5%] pt-10">
          {/* Result card */}
          <div className={`bg-gradient-to-br ${test.color} border border-current/10 rounded-[28px] p-8 mb-6 text-center`}>
            <span className="text-[3.5rem] block mb-4">{test.icon}</span>
            <p className={`inline-block text-[0.72rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 ${bandColors[result.band] ?? 'text-teal-deep bg-teal-ghost'}`}>
              {result.band.replace('-', ' ')} · Score {result.score}
            </p>
            <h1 className="font-display text-[1.6rem] font-bold text-charcoal leading-snug mb-4">
              {res.heading}
            </h1>
            <p className="text-text-mid text-[0.95rem] leading-[1.85]">{res.message}</p>
          </div>

          {/* What helps you */}
          <div className="bg-white rounded-[24px] p-6 shadow-card border border-teal-light mb-5">
            <h2 className="font-display font-bold text-charcoal text-[1.1rem] mb-4">
              🌱 What might help you right now
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {res.recommendations.map(r => (
                <Link key={r.href} href={r.href}
                  className="flex items-center gap-3 bg-teal-ghost/50 hover:bg-teal-ghost border border-teal-light hover:border-teal-mid rounded-[14px] px-4 py-3 no-underline transition-all group">
                  <span className="text-[1.4rem]">{r.icon}</span>
                  <span className="font-semibold text-charcoal text-[0.88rem] group-hover:text-teal-deep transition-colors">{r.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Important note for high scores */}
          {['severe', 'moderately-severe'].includes(result.band) && (
            <div className="bg-red-50 border border-red-200 rounded-[20px] p-5 mb-5">
              <p className="font-bold text-red-700 text-[0.9rem] mb-1">📞 Please reach out for support</p>
              <p className="text-red-600 text-[0.82rem] leading-[1.7]">
                Your results suggest you may benefit from talking to a mental health professional.
                Find a free, confidential helpline in your country at{' '}
                <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-red-800">findahelpline.com</a>
                {' '}— or call <strong>988</strong> (US &amp; Canada) or <strong>116 123</strong> (UK &amp; Ireland).
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap justify-center">
            <button onClick={() => setView('hub')}
              className="bg-teal-deep text-white px-7 py-3 rounded-full font-semibold text-[0.9rem] hover:bg-teal-dark transition-colors">
              ← Back to all tests
            </button>
            <button onClick={() => startTest(testIdx)}
              className="border border-teal-light text-text-mid px-6 py-3 rounded-full font-semibold text-[0.88rem] hover:bg-teal-ghost transition-colors">
              Retake this test
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Taking test view ──────────────────────────────────────────────────────
  if (view === 'taking') {
    const progress = Math.round((qIdx / test.questions.length) * 100)
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-ghost/50 to-ivory pt-[72px]">
        <div className="max-w-xl mx-auto px-[5%] pt-8 pb-16">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setView('hub')} className="text-text-xlight hover:text-charcoal transition-colors text-[0.82rem]">← Back</button>
            <div className="flex-1 h-2 bg-teal-light/50 rounded-full overflow-hidden">
              <div className="h-full bg-teal-mid rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-text-xlight text-[0.72rem] font-semibold">{qIdx + 1}/{test.questions.length}</span>
          </div>

          {/* Test info */}
          <div className="text-center mb-6">
            <span className="text-[2.5rem] block mb-2">{test.icon}</span>
            <h1 className="font-display font-bold text-charcoal text-[1.3rem]">{test.title}</h1>
            <p className="text-text-xlight text-[0.78rem] mt-1">{test.timeframe}</p>
          </div>

          {/* Question */}
          <div className="bg-white rounded-[24px] p-7 shadow-lift border border-teal-light mb-4">
            <p className="font-display font-bold text-charcoal text-[1.1rem] leading-snug mb-6 text-center">
              &ldquo;{test.questions[qIdx]}&rdquo;
            </p>
            <div className="space-y-2.5">
              {test.options.map((opt, i) => (
                <button key={i} onClick={() => selectAnswer(i)}
                  className="w-full text-left px-5 py-3.5 rounded-[14px] border border-teal-light text-[0.9rem] font-medium text-text-mid
                    hover:bg-teal-ghost hover:border-teal-mid hover:text-teal-deep hover:-translate-y-0.5 transition-all active:scale-95">
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <p className="text-center text-text-xlight text-[0.72rem]">Tap an answer to continue · {test.questions.length - qIdx - 1} questions left</p>
        </div>
      </div>
    )
  }

  // ── Hub view ──────────────────────────────────────────────────────────────
  const bandLabel: Record<string, { label: string; color: string }> = {
    minimal:          { label: 'Minimal',      color: 'text-teal-deep bg-teal-ghost' },
    mild:             { label: 'Mild',         color: 'text-amber-700 bg-amber/15' },
    moderate:         { label: 'Moderate',     color: 'text-orange-600 bg-orange-50' },
    'moderately-severe': { label: 'Mod. Severe', color: 'text-red-600 bg-red-50' },
    severe:           { label: 'Severe',       color: 'text-red-700 bg-red-100' },
    low:              { label: 'Low',          color: 'text-blue-600 bg-blue-50' },
    high:             { label: 'High',         color: 'text-red-600 bg-red-50' },
    flourishing:      { label: 'Flourishing',  color: 'text-teal-deep bg-teal-ghost' },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost/50 to-ivory pt-[72px] pb-16">

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-deep to-teal-dark py-12 px-[5%] text-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-amber-soft text-[0.72rem] font-bold tracking-widest uppercase mb-2">Science-backed · Personalised</p>
          <h1 className="font-display text-[2rem] sm:text-[2.4rem] font-bold leading-tight mb-3">
            Wellness Assessments 🧠
          </h1>
          <p className="text-white/70 text-[0.97rem] leading-[1.8] max-w-[560px]">
            These tests don&apos;t judge you — they help you understand yourself. Each one takes 2–5 minutes and gives you warm, personalised insights and next steps.
          </p>
          {!session && (
            <div className="mt-5 flex gap-3 flex-wrap">
              <Link href="/register" className="bg-amber text-charcoal px-6 py-2.5 rounded-full font-semibold text-[0.88rem] no-underline hover:bg-amber-soft transition-colors">
                Create free account to save results →
              </Link>
              <Link href="/login" className="border border-white/30 text-white px-6 py-2.5 rounded-full font-medium text-[0.88rem] no-underline hover:border-white transition-colors">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tests grid */}
      <div className="max-w-4xl mx-auto px-[5%] py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTS.map((t, i) => {
            const prev = latest[t.key]
            const bd = prev ? bandLabel[prev.band] : null
            return (
              <div key={t.key} className={`bg-gradient-to-br ${t.color} rounded-[24px] p-6 border border-current/10 hover:-translate-y-1 hover:shadow-lift transition-all`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[2.2rem]">{t.icon}</span>
                  {bd && (
                    <span className={`text-[0.65rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${bd.color}`}>
                      {bd.label}
                    </span>
                  )}
                </div>
                <h3 className={`font-display font-bold text-[1.1rem] ${t.textColor} mb-0.5`}>{t.title}</h3>
                <p className="text-text-xlight text-[0.7rem] mb-2">{t.subtitle}</p>
                <p className="text-text-mid text-[0.82rem] leading-[1.65] mb-4">{t.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-text-xlight text-[0.72rem]">⏱ {t.duration}</span>
                  <button onClick={() => startTest(i)}
                    className="bg-white/80 hover:bg-white text-teal-deep font-bold text-[0.82rem] px-4 py-2 rounded-full shadow-sm hover:-translate-y-0.5 transition-all">
                    {prev ? 'Retake →' : 'Start →'}
                  </button>
                </div>
                {prev && (
                  <p className="text-text-xlight text-[0.65rem] mt-2 text-right">
                    Last taken {new Date(prev.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-10 bg-white border border-teal-light rounded-[20px] p-6 text-center">
          <p className="text-[1.3rem] mb-2">💙</p>
          <p className="font-semibold text-charcoal text-[0.95rem] mb-2">These tests are for self-awareness, not diagnosis</p>
          <p className="text-text-xlight text-[0.82rem] max-w-lg mx-auto leading-[1.7]">
            The results here are a starting point for reflection — not a clinical diagnosis. If you&apos;re concerned about your mental health, please speak to a qualified professional. You deserve proper support.
          </p>
        </div>
      </div>
    </div>
  )
}
