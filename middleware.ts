import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

/**
 * Protect all tool, community, and profile routes behind sign-in.
 * Unauthenticated visitors are redirected to /login?callbackUrl=<original URL>
 * so they land back on the page they wanted after signing in.
 */
export default withAuth(
  function middleware(req) {
    // Allow the request to proceed — the user is authenticated
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

// Routes that require authentication
export const config = {
  matcher: [
    // Wellness Tools — Reflect & Track
    '/journal/:path*',
    '/mood/:path*',
    '/sleep/:path*',
    '/water/:path*',
    '/calendar/:path*',
    '/snapshot/:path*',
    '/intention/:path*',
    '/habits/:path*',
    '/habits-lab/:path*',
    // Wellness Tools — Calm
    '/breathing/:path*',
    '/meditation/:path*',
    '/sounds/:path*',
    '/coach/:path*',
    '/reframe/:path*',
    // Wellness Tools — Grow
    '/challenges/:path*',
    '/vision-board/:path*',
    // Wellness Tools — Create
    '/affirmation/:path*',
    '/quotes/:path*',
    '/drawing/:path*',
    // Community features
    '/tribe/:path*',
    '/circles/:path*',
    '/gratitude-wall/:path*',
    '/kindness-map/:path*',
    '/community/gallery/:path*',
    '/notifications/:path*',
    // Personal pages
    '/profile/:path*',
    '/assessments/:path*',
    '/quiz/:path*',
  ],
}
