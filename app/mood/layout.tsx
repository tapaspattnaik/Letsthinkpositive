import type { Metadata } from 'next'
import { ToolFAQ, type FAQItem } from '@/components/ToolFAQ'

export const metadata: Metadata = {
  alternates: { canonical: '/mood' },
  title: 'Free Online Mood Tracker — Daily Mood Journal, No App',
  description: 'Track your mood free online and spot emotional patterns over time. A simple, private daily mood check-in — no app download and no signup needed.',
}

const FAQ: FAQItem[] = [
  { q: 'Is this mood tracker free?', a: 'Yes — it\'s free, private, and needs no app or signup. Your check-ins stay on your device.' },
  { q: 'How does tracking my mood help?', a: 'Logging your mood daily reveals patterns over time — your triggers, trends, and what helps. That self-awareness supports better choices for your wellbeing.' },
  { q: 'How often should I log my mood?', a: 'Once a day is plenty. Pick a consistent moment, like morning or evening, so the habit sticks and the patterns become meaningful.' },
  { q: 'Is my mood data private?', a: 'Yes. Your mood history is kept private to you and is never shared or sold.' },
]

export default function MoodLayout({ children }: { children: React.ReactNode }) {
  return <>{children}<ToolFAQ items={FAQ} /></>
}
