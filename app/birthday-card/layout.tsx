import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/birthday-card' },
  title: 'AI Birthday Card Generator',
  description: 'Create a beautiful, personalised birthday card in seconds. Let AI write a warm, heartfelt, funny, or poetic birthday message, pick a design, and download or share it free.',
}

export default function BirthdayCardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
