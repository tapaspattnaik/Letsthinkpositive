import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Habit Tracker',
  description: 'Build small daily habits that compound into big change. Track your streaks and stay consistent with your wellness goals.',
}

export default function HabitsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
