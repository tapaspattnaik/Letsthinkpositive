import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Positivity Feed',
  description: 'Your daily stream of uplifting stories, affirmations, and community moments to keep your mindset positive.',
}

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
