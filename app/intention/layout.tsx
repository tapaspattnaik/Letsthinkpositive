import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:       'Morning Intention | LetsThinkPositive',
  description: 'Start each day with purpose. Set one word, one goal, and one act of kindness.',
}

export default function IntentionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
