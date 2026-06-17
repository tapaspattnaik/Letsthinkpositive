import type { Metadata } from 'next'
import { ToolFAQ, type FAQItem } from '@/components/ToolFAQ'

export const metadata: Metadata = {
  alternates: { canonical: '/sleep' },
  title: 'Free Sleep Tracker Online — Build a Better Bedtime Routine',
  description: 'Track your sleep free online and build healthier rest habits. Log sleep quality and duration to fix your routine and calm a racing mind — no app required.',
  openGraph: {
    title: 'Free Sleep Tracker Online — letsthinkpositive',
    description: 'Track your sleep quality every night, monitor streaks, and get science-backed tips tailored to how you slept.',
  },
}

const FAQ: FAQItem[] = [
  { q: 'Is this sleep tracker free?', a: 'Yes — free, with no app download and no signup. Log your sleep right in your browser.' },
  { q: 'How can I sleep better?', a: 'A consistent bedtime, limiting screens before bed, and winding down with slow breathing all help. Tracking your sleep shows which changes are actually working for you.' },
  { q: 'What does the sleep tracker measure?', a: 'You log your sleep duration and quality each night, and the tool surfaces your patterns plus tips tailored to how you\'ve been sleeping.' },
  { q: 'Why do I have racing thoughts when trying to sleep?', a: 'When the day goes quiet, the mind has fewer distractions, so worries surface. A wind-down routine and paced breathing before bed help calm that mental noise.' },
]

export default function SleepLayout({ children }: { children: React.ReactNode }) {
  return <>{children}<ToolFAQ items={FAQ} /></>
}
