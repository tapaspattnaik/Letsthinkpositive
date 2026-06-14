import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/rewards' },
  title: 'Rewards Store',
  description: 'Spend your Hope Coins on streak freezes, badges, and perks. Earn coins through daily check-ins and wellness activities.',
}

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
