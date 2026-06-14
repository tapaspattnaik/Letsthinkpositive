import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/future-letter' },
  title: 'Letter from Your Future Self',
  description: 'A warm, personal AI-written letter from your future self — looking back on your wellness journey with pride and encouragement.',
}

export default function FutureLetterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
