import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/snapshot' },
  title:       'My Wellness Snapshot',
  description: 'See your personal weekly wellness report — mood trends, habit completion, streak and more.',
}

export default function SnapshotLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
