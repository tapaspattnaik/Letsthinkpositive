import type { Metadata } from 'next'
import { SessionProvider } from '@/components/layout/SessionProvider'

export const metadata: Metadata = {
  alternates: { canonical: '/bit-chat' },
  title: 'Bit — AI Companion | letsthinkpositive',
  description: 'Chat with Bit, your calm AI wellness companion.',
}

export default function StandaloneLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
