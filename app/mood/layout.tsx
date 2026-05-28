import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mood Tracker',
  description: 'Track your daily mood, spot patterns over time, and build self-awareness with a simple, private mood check-in.',
}

export default function MoodLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
