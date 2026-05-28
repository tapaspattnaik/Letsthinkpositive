import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:       'Quote Card Creator | Let\'s Think Positive',
  description: 'Create beautiful shareable quote cards. Pick a quote, choose a design, download and share.',
}

export default function QuotesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
