import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/coach' },
  title: 'Calm Coach',
  description: 'Chat with Bit, your AI-powered calm coach. Get personalised support for mood, anxiety, motivation, gratitude, sleep, and daily reflection — available any time.',
  openGraph: {
    title: 'Calm Coach — letsthinkpositive',
    description: 'Your personal AI wellness coach. Choose a topic — mood, motivation, calm, gratitude, sleep — and start a supportive, private conversation.',
  },
}

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
