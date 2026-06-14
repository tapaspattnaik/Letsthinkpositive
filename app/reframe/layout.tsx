import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/reframe' },
  title: 'Thought Reframer — CBT-Based Reframing',
  description: 'Type a negative thought and get a compassionate, evidence-based reframe using CBT techniques.',
}

export default function ReframeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
