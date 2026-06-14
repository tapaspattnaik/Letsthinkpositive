import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/blog' },
  title: 'Blog',
  description: 'Real words from real lives — stories, lessons, and ideas from the letsthinkpositive community.',
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
