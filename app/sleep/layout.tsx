import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sleep Tracker',
  description: 'Log your sleep, track your quality patterns, and get personalised tips to sleep better. Build a consistent bedtime routine and wake up feeling restored.',
  openGraph: {
    title: 'Sleep Tracker — letsthinkpositive',
    description: 'Track your sleep quality every night, monitor streaks, and get science-backed tips tailored to how you slept.',
  },
}

export default function SleepLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
