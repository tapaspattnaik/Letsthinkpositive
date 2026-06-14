import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/contact' },
  title: 'Contact Us',
  description: 'Get in touch with the letsthinkpositive team. Share feedback, report an issue, suggest a feature, or just say hello — we read every message.',
  openGraph: {
    title: 'Contact Us — letsthinkpositive',
    description: 'Reach out to the letsthinkpositive team — feedback, ideas, collaborations, or just a kind word. We\'d love to hear from you.',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
