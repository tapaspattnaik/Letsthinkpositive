import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Wellness Tools',
  description: 'Explore every wellness tool on letsthinkpositive — guided meditation, mood tracking, habit builder, breathing exercises, journaling, sleep tracker, and much more.',
  openGraph: {
    title: 'All Wellness Tools — letsthinkpositive',
    description: 'Your complete mental wellness toolkit: meditation, breathwork, mood tracking, journaling, habit building, gratitude, vision board, and AI coaching — all in one place.',
  },
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
