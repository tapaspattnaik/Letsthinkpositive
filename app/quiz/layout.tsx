import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/quiz' },
  title: 'Wellness Quiz',
  description: 'Discover your wellness profile with our quick quiz. Find out which tools, practices, and habits suit your personality and lifestyle best.',
  openGraph: {
    title: 'Wellness Quiz — letsthinkpositive',
    description: 'Answer a few questions and get a personalised wellness recommendation — find the right tools, habits, and practices for your unique profile.',
  },
}

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
