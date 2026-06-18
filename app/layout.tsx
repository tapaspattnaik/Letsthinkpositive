import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Serif_Display } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SessionProvider } from '@/components/layout/SessionProvider'
import { BitWidgetLazy } from '@/components/BitWidgetLazy'
import { HeaderHeight } from '@/components/layout/HeaderHeight'
import { BottomNav } from '@/components/layout/BottomNav'
import { AppLoader } from '@/components/layout/AppLoader'
import { ToolBreadcrumb } from '@/components/layout/ToolBreadcrumb'
import { LanguageProvider } from '@/context/LanguageContext'
import { JsonLd } from '@/components/JsonLd'
import Script from 'next/script'
import './globals.css'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-9X53ZWQZ27'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://letsthinkpositive.com'

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
    locale:   'en_US',
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
      {/* Minimal critical CSS — ensures the page is never completely unstyled
          even if the Tailwind stylesheet fails to load on Hostinger cold start */}
      <head>
        {/* ── Structured data: Organization + WebSite ─────────────── */}
        <JsonLd data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'letsthinkpositive',
            url: SITE_URL,
            logo: `${SITE_URL}/icons/icon-512.png`,
            description: 'A space for mental wellness, gratitude, calm sounds, and AI-guided positivity.',
            sameAs: [
              'https://twitter.com/letsthinkpos',
              'https://www.instagram.com/letsthinkpositive',
              'https://www.facebook.com/letsthinkpositive',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer support',
              url: `${SITE_URL}/contact`,
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'letsthinkpositive',
            url: SITE_URL,
            description: 'A space for mental wellness, gratitude, calm sounds, and AI-guided positivity.',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          },
        ]} />
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --teal-deep: #1A6B6B; --ivory: #F8F8F4; }
          body { background: var(--ivory); margin: 0; font-family: system-ui, sans-serif; }
          * { box-sizing: border-box; }
          a { color: var(--teal-deep); }

          /* Loader fallback: if React never mounts (JS error / network fail),
             this CSS animation auto-hides the loader after 2s. */
          @keyframes ltp-auto-hide {
            0%, 70% { opacity: 1; }
            100%     { opacity: 0; pointer-events: none; visibility: hidden; }
          }
          #ltp-loader { animation: ltp-auto-hide 2s ease-out 0.2s forwards; }
        `}} />
      </head>
      <body className="font-body" suppressHydrationWarning>
        {/* AppLoader is OUTSIDE providers so it mounts even if a provider throws.
            It owns the loader div and unmounts it via useState on first render. */}
        <AppLoader />
        <LanguageProvider>
        <SessionProvider>
          {/* Skip-to-content — visible on focus for keyboard/screen-reader users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:bg-teal-deep focus:text-white focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-semibold"
          >
            Skip to main content
          </a>
          {/* Single fixed header */}
          <div id="site-header" className="fixed top-0 left-0 right-0 z-50">
            <Navbar />
          </div>
          {/* Dynamically sets main padding-top = actual header height (navbar ± banner) */}
          <HeaderHeight />
          {/* Floating ← Back / My Space pills on tool pages (desktop, signed-in) */}
          <ToolBreadcrumb />
          <main id="main-content" className="pt-[72px] pb-[60px] lg:pb-0">
            {children}
          </main>
          {/* Bottom nav — mobile only, hidden on lg+ */}
          <BottomNav />
          {/* Footer hidden on mobile — bottom nav replaces it */}
          <div className="hidden lg:block"><Footer /></div>
          <BitWidgetLazy />
        </SessionProvider>
        </LanguageProvider>

        {/* ── Google Analytics 4 ───────────────────────────────────
            strategy="afterInteractive" loads after hydration — zero
            impact on LCP / page speed scores.                       */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </body>
    </html>
  )
}
