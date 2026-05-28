import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wellness Circles',
  description: 'Join small, focused wellness circles built around topics like anxiety, sleep, gratitude, and more. Find your people.',
}

export default function CirclesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
