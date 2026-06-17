import type { Metadata } from 'next'
import { ToolFAQ, type FAQItem } from '@/components/ToolFAQ'

export const metadata: Metadata = {
  alternates: { canonical: '/breathing' },
  title: 'Free Breathing Exercises Online — Box & 4-7-8 Breathing Timer',
  description: 'Free guided breathing exercises online — Box Breathing, 4-7-8 and Calm Breath to ease anxiety and stress in minutes. No app, no signup, works on any device.',
}

const FAQ: FAQItem[] = [
  { q: 'Do breathing exercises really help with anxiety?', a: 'Yes. Slow, paced breathing activates the parasympathetic nervous system, which lowers heart rate and eases the body\'s stress response within minutes. Techniques like box breathing and 4-7-8 are widely used for exactly this.' },
  { q: 'Is this breathing tool free?', a: 'Completely free — no app to download and no signup. It works in any browser on phone, tablet, or desktop.' },
  { q: 'What is box breathing?', a: 'Box breathing is a four-count pattern — inhale for 4, hold for 4, exhale for 4, hold for 4 — that steadies your breath and calms the mind. The on-screen timer guides you through each phase.' },
  { q: 'How long should I do breathing exercises?', a: 'Even 2–5 minutes can shift how you feel. For ongoing benefit, a few minutes once or twice a day works well.' },
]

export default function BreathingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}<ToolFAQ items={FAQ} /></>
}
