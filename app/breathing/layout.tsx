import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Breathing Exercises',
  description: 'Guided breathing exercises including Box Breathing, 4-7-8, and Calm Breath to reduce anxiety, improve focus, and prepare for sleep.',
}

export default function BreathingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
