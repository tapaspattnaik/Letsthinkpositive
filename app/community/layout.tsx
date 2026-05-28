import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community',
  description: 'Share stories, post wishes, and connect with a warm community working on their mental wellness journey.',
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
