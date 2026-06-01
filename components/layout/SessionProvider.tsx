'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider
      // No focus refetch — was firing /api/auth/session on every tab switch.
      refetchOnWindowFocus={false}
      // refetchInterval=0 fully DISABLES periodic session polling. Sessions are
      // long-lived JWTs, so there's no need to poll /api/auth/session on a timer
      // (NextAuth v4's interval keeps running even on hidden tabs, which was a
      // major source of the repeated /api/auth/session 503 retries Hostinger saw).
      // The session is still validated on every page load / navigation.
      refetchInterval={0}
      // Don't refetch when the browser regains connectivity either.
      refetchWhenOffline={false}
    >
      {children}
    </NextAuthSessionProvider>
  )
}
