import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/good-news' },
  title: 'Good News',
  description: 'Your daily dose of positive news. Uplifting stories from around the world — science breakthroughs, acts of kindness, environmental wins, and human connection.',
  openGraph: {
    title: 'Good News — letsthinkpositive',
    description: 'Filter out the noise. Read only good news — acts of kindness, science breakthroughs, environmental wins, and stories that remind you the world is still beautiful.',
  },
}

export default function GoodNewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
