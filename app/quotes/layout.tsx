import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/quotes' },
  title:       'Free Quote Maker — Create & Share Motivational Quote Cards',
  description: 'Design beautiful motivational quote cards free online. Add photo backgrounds and share to social media — no watermark, no signup, no app.',
}

export default function QuotesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
