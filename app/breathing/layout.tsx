import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/breathing' },
  title: 'Free Breathing Exercises Online — Box & 4-7-8 Breathing Timer',
  description: 'Free guided breathing exercises online — Box Breathing, 4-7-8 and Calm Breath to ease anxiety and stress in minutes. No app, no signup, works on any device.',
}

export default function BreathingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
