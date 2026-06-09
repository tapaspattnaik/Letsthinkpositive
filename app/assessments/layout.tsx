import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wellness Assessments',
  description: 'Take evidence-informed wellness assessments to understand your mental and emotional health. Track your scores over time and get guidance on where to focus.',
  openGraph: {
    title: 'Wellness Assessments — letsthinkpositive',
    description: 'Measure your mental wellness with structured, evidence-informed assessments. Understand your baseline, track progress, and discover where to focus your energy.',
  },
}

export default function AssessmentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
