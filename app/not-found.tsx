import Link from 'next/link'
import { LtpLogo } from '@/components/ui/LtpLogo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-ghost to-ivory flex items-center justify-center px-4 pt-[72px]">
      <div className="max-w-lg w-full text-center">
        <Link href="/" className="inline-flex items-center justify-center mb-8">
          <LtpLogo size={52} />
        </Link>

        {/* Decorative 404 */}
        <div className="relative mb-8">
          <p className="font-display text-[8rem] sm:text-[10rem] font-bold text-teal-light/40 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[4rem]">🌿</span>
          </div>
        </div>

        <h1 className="font-display text-[1.8rem] text-charcoal font-bold mb-3">
          Page not found
        </h1>
        <p className="text-text-mid text-[0.97rem] leading-[1.8] mb-8 max-w-sm mx-auto">
          This page seems to have wandered off on a wellness retreat. Let&apos;s get you back somewhere good.
        </p>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 text-left">
          {[
            { href: '/',            icon: '🏠', label: 'Home'           },
            { href: '/journal',     icon: '📓', label: 'Journal'        },
            { href: '/breathing',   icon: '🌬️', label: 'Breathe'        },
            { href: '/mood',        icon: '📊', label: 'Mood Tracker'   },
            { href: '/challenges',  icon: '🏆', label: 'Challenges'     },
            { href: '/community',   icon: '💛', label: 'Community'      },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-2.5 bg-white border border-teal-light rounded-[14px] px-4 py-3 no-underline hover:border-teal-mid hover:bg-teal-ghost hover:-translate-y-0.5 transition-all group">
              <span className="text-[1.2rem]">{l.icon}</span>
              <span className="text-[0.83rem] font-semibold text-charcoal group-hover:text-teal-deep transition-colors">{l.label}</span>
            </Link>
          ))}
        </div>

        <Link href="/"
          className="inline-block bg-teal-deep text-white px-8 py-3.5 rounded-full font-semibold text-[0.95rem] no-underline hover:bg-teal-dark transition-colors">
          ← Back to home
        </Link>
        <p className="text-text-xlight text-[0.75rem] mt-6">letsthinkpositive — where every thought begins with hope</p>
      </div>
    </div>
  )
}
