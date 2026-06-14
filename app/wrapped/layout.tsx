import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/wrapped' },
  title: 'Your Year in Positivity',
  description: 'Your personal wellness year in review — streaks, moods, challenges, and growth, all in one beautiful recap.',
}

export default function WrappedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
