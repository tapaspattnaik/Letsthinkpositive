import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/search' },
  title: 'Search',
  description: 'Search across all of letsthinkpositive — blog articles, library guides, community posts, tools, and members. Find exactly what you need for your wellness journey.',
  openGraph: {
    title: 'Search — letsthinkpositive',
    description: 'Search the full letsthinkpositive library: articles, wellness tools, community posts, guides, and people.',
  },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
