import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wellness Calendar',
  description: 'Plan and visualise your wellness journey. Track moods, habits, check-ins, and milestones across the month — your personal wellbeing at a glance.',
  openGraph: {
    title: 'Wellness Calendar — letsthinkpositive',
    description: 'See your whole month in one view — moods, habits, journaling, and check-ins visualised on a wellness calendar.',
  },
}

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
