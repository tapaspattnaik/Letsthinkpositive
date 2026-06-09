import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wellness Challenges',
  description: 'Join daily and weekly wellness challenges — gratitude, mindfulness, kindness, movement and more. Small actions, real change. Start your next challenge today.',
  openGraph: {
    title: 'Wellness Challenges — letsthinkpositive',
    description: 'Take on bite-sized wellness challenges designed to build positive habits — gratitude, mindfulness, kindness, hydration, movement and more.',
  },
}

export default function ChallengesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
