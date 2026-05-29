'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LtpLogo } from '@/components/ui/LtpLogo'
import { Suspense } from 'react'

const ERRORS: Record<string, { title: string; message: string; action: string; href: string }> = {
  OAuthAccountNotLinked: {
    title:   'Email already registered',
    message: 'This email is linked to a password account. Sign in with your email and password instead, then you can connect Google from your profile.',
    action:  'Sign in with email →',
    href:    '/login',
  },
  OAuthCallback: {
    title:   'Google sign-in failed',
    message: 'Something went wrong while connecting to Google. This can happen if you closed the popup or the request timed out. Please try again.',
    action:  'Try again →',
    href:    '/login',
  },
  OAuthCreateAccount: {
    title:   'Could not create account',
    message: 'We weren\'t able to create your account via Google right now. This is usually a temporary issue. Please try again in a moment.',
    action:  'Try again →',
    href:    '/login',
  },
  OAuthSignin: {
    title:   'Google sign-in error',
    message: 'There was a problem starting the Google sign-in flow. Please try again.',
    action:  'Try again →',
    href:    '/login',
  },
  Signin: {
    title:   'Sign-in failed',
    message: 'We couldn\'t sign you in. Please check your email and password and try again.',
    action:  'Back to sign in →',
    href:    '/login',
  },
  CredentialsSignin: {
    title:   'Incorrect email or password',
    message: 'The email or password you entered doesn\'t match our records. Please check your details and try again, or reset your password.',
    action:  'Try again →',
    href:    '/login',
  },
  SessionRequired: {
    title:   'Sign in required',
    message: 'You need to be signed in to access that page.',
    action:  'Sign in →',
    href:    '/login',
  },
  Configuration: {
    title:   'Server configuration error',
    message: 'There\'s a temporary issue with our sign-in service. Our team has been notified. Please try again shortly or contact support if this persists.',
    action:  'Go home →',
    href:    '/',
  },
  AccessDenied: {
    title:   'Access denied',
    message: 'You don\'t have permission to sign in with that account.',
    action:  'Go home →',
    href:    '/',
  },
  Verification: {
    title:   'Link expired',
    message: 'This sign-in link has expired or already been used. Please request a new one.',
    action:  'Back to sign in →',
    href:    '/login',
  },
}

const DEFAULT = {
  title:   'Something went wrong',
  message: 'An unexpected error occurred during sign-in. Please try again, and contact us if the problem continues.',
  action:  'Back to sign in →',
  href:    '/login',
}

function ErrorContent() {
  const params = useSearchParams()
  const code   = params.get('error') ?? ''
  const info   = ERRORS[code] ?? DEFAULT

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-ghost to-ivory flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-[480px] text-center">

        {/* Logo */}
        <Link href="/" className="inline-flex items-center justify-center mb-6">
          <LtpLogo size={48} />
        </Link>

        {/* Card */}
        <div className="bg-white rounded-[28px] p-8 shadow-lift border border-teal-light">

          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          <h1 className="font-display text-[1.5rem] text-charcoal font-bold mb-3 leading-snug">
            {info.title}
          </h1>

          <p className="text-text-mid text-[0.9rem] leading-[1.75] mb-6">
            {info.message}
          </p>

          {/* Error code badge */}
          {code && (
            <div className="inline-block bg-teal-ghost text-text-xlight text-[0.72rem] font-mono px-3 py-1 rounded-full mb-6">
              Error code: {code}
            </div>
          )}

          {/* Primary action */}
          <Link
            href={info.href}
            className="block w-full bg-teal-deep text-white py-3.5 rounded-full font-semibold text-[0.95rem] hover:bg-teal-dark transition-colors no-underline mb-3">
            {info.action}
          </Link>

          {/* Secondary links */}
          <div className="flex items-center justify-center gap-4 text-[0.82rem]">
            <Link href="/register" className="text-teal-mid hover:text-teal-deep font-medium no-underline">
              Create account
            </Link>
            <span className="text-teal-light">·</span>
            <Link href="/" className="text-teal-mid hover:text-teal-deep font-medium no-underline">
              Go home
            </Link>
            <span className="text-teal-light">·</span>
            <Link href="/contact" className="text-teal-mid hover:text-teal-deep font-medium no-underline">
              Get help
            </Link>
          </div>
        </div>

        <p className="text-[0.78rem] text-text-xlight mt-6">
          letsthinkpositive — where every thought begins with hope
        </p>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  )
}
