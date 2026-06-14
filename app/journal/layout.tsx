import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/journal' },
  title: 'Gratitude Journal',
  description: 'Write daily gratitude entries, reflect on the good in your life, and build a habit of noticing what matters most.',
}

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
