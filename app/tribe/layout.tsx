import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/tribe' },
  title: 'My Tribe',
  description: 'Your personal wellness circle. See the people you follow and who follow you — build meaningful connections on your journey toward positivity and wellbeing.',
  openGraph: {
    title: 'My Tribe — letsthinkpositive',
    description: 'Build your wellness tribe. Connect with like-minded people, follow their journeys, and grow together toward a more positive life.',
  },
}

export default function TribeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
