'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider
      // CRITICAL: Disabling refetchOnWindowFocus prevents /api/auth/session
      // being called every time the user switches back to this tab.
      // This was the primary source of request bursts hitting Hostinger's limit.
      refetchOnWindowFocus={false}
      // Only poll the session every 10 minutes — sessions are long-lived
      // in a wellness app, 10 min is more than enough to detect expiry.
      refetchInterval={10 * 60}
    >
      {children}
    </NextAuthSessionProvider>
  )
}
