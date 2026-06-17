import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/affirmation' },
  title: 'Daily Affirmation Generator — Free Positive Affirmation Cards',
  description:
    'Generate a free personalised daily affirmation and download or share it. Positive affirmation cards for confidence, calm, and self-belief — no app needed.',
}

export default function AffirmationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
