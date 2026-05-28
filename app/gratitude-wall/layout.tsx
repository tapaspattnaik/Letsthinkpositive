import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gratitude Wall',
  description: 'A daily public space where people share one thing they\'re grateful for today.',
}

export default function GratitudeWallLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
