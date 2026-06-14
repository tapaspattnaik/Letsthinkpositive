import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/water' },
  title: 'Water Tracker',
  description: 'Track your daily water intake and stay hydrated. Simple, satisfying hydration logging that helps you build a consistent healthy habit.',
  openGraph: {
    title: 'Water Tracker — letsthinkpositive',
    description: 'Log your glasses of water, hit your daily target, and build a consistent hydration habit — one sip at a time.',
  },
}

export default function WaterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
