import type { Metadata } from 'next'
import { ToolFAQ, type FAQItem } from '@/components/ToolFAQ'

export const metadata: Metadata = {
  alternates: { canonical: '/journal' },
  title: 'Free Online Gratitude Journal — Guided Daily Prompts',
  description: 'A free online gratitude journal with guided daily prompts. Reflect, de-stress, and build a positive mindset — private, no signup, works in your browser.',
}

const FAQ: FAQItem[] = [
  { q: 'Is this gratitude journal free?', a: 'Yes — free and private, with no app to download and no signup. Just open it and start writing.' },
  { q: 'What should I write in a gratitude journal?', a: 'Anything you\'re thankful for, big or small — a kind word, a good meal, a moment of calm. Guided daily prompts help when you\'re not sure where to start.' },
  { q: 'Does gratitude journaling actually work?', a: 'Research links a regular gratitude practice to improved mood and wellbeing. Even a few lines a day can shift your focus toward the positive.' },
  { q: 'How often should I journal?', a: 'Daily is ideal, but a few times a week still helps. Short and consistent beats long and occasional.' },
]

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}<ToolFAQ items={FAQ} /></>
}
