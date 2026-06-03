import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes that require authentication
const PROTECTED_PREFIXES = [
  '/journal', '/mood', '/sleep', '/water', '/calendar', '/snapshot',
  '/intention', '/habits', '/breathing', '/meditation', '/sounds',
  '/coach', '/reframe', '/challenges', '/vision-board',
  '/affirmation', '/quotes', '/drawing',
  '/tribe', '/circles', '/gratitude-wall', '/kindness-map',
  '/community/gallery', '/notifications',
  '/profile', '/assessments', '/quiz',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Skip non-page requests ────────────────────────────────────────────────
  // Next.js RSC prefetch requests have this header — never redirect them
  // or the page will render as raw JSON instead of HTML.
  if (req.headers.get('rsc') || req.headers.get('next-router-prefetch')) {
    return NextResponse.next()
  }
  // Skip static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')  // static files (.png, .js, .css etc.)
  ) {
    return NextResponse.next()
  }

  // ── Check if route is protected ──────────────────────────────────────────
  const isProtected = PROTECTED_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))
  if (!isProtected) return NextResponse.next()

  // ── Check auth token ──────────────────────────────────────────────────────
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (token) {
    // Authenticated — let through
    return NextResponse.next()
  }

  // ── Redirect to login with callbackUrl ────────────────────────────────────
  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('callbackUrl', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|js|css|woff|woff2|ttf|eot)).*)',
  ],
}
