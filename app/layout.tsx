import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Serif_Display } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SessionProvider } from '@/components/layout/SessionProvider'
import { BitWidget } from '@/components/BitWidget'
import { ConstructionBanner } from '@/components/layout/ConstructionBanner'
import { HeaderHeight } from '@/components/layout/HeaderHeight'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
  display: 'swap',
})

export const viewport = {
  themeColor: '#1A6B6B',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default:  'letsthinkpositive — where every thought begins with hope',
    template: '%s | letsthinkpositive',
  },
  description: 'A space for mental wellness, gratitude, calm sounds, and AI-guided positivity. Built by Tapas Pattanaik.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://letsthinkpositive.com'),
  openGraph: {
    siteName: 'letsthinkpositive',
    locale:   'en_IN',
    type:     'website',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'letsthinkpositive',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmSerif.variable}`} suppressHydrationWarning>
      <body className="font-body" suppressHydrationWarning>
        <SessionProvider>
          {/* Skip-to-content — visible on focus for keyboard/screen-reader users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:bg-teal-deep focus:text-white focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-semibold"
          >
            Skip to main content
          </a>
          {/* Single fixed header — banner + navbar stacked, no z-index clash */}
          <div id="site-header" className="fixed top-0 left-0 right-0 z-50">
            <ConstructionBanner />
            <Navbar />
          </div>
          {/* Dynamically sets main padding-top = actual header height (navbar ± banner) */}
          <HeaderHeight />
          <main id="main-content" className="pt-[72px]">
            {children}
          </main>
          <Footer />
          <BitWidget />
        </SessionProvider>
      </body>
    </html>
  )
}
