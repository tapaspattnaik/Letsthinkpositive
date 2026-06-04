'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { getLanguage } from '@/lib/languages'

interface Props {
  pageUrl?: string  // full URL of the page to translate (defaults to window.location.href)
}

export function TranslateBanner({ pageUrl }: Props) {
  const { language } = useLanguage()
  const [url, setUrl] = useState(pageUrl || '')
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!pageUrl) setUrl(window.location.href)
  }, [pageUrl])

  // Don't show for English or if dismissed
  if (language === 'en' || dismissed || !url) return null

  const lang        = getLanguage(language)
  const translateUrl = `https://translate.google.com/translate?sl=en&tl=${language}&u=${encodeURIComponent(url)}`

  return (
    <div className="flex items-center justify-between gap-3 bg-teal-ghost border border-teal-light rounded-2xl px-4 py-3 mb-6">
      <div className="flex items-center gap-3">
        {/* Google Translate icon */}
        <div className="w-8 h-8 rounded-full bg-white border border-teal-light flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg className="w-4 h-4 text-teal-deep" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
          </svg>
        </div>
        <div>
          <p className="text-[0.84rem] font-semibold text-charcoal leading-none">
            {lang.flag} Read in {lang.label}
          </p>
          <p className="text-[0.71rem] text-text-xlight mt-0.5">
            This article is in English — translate it with Google Translate
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <a
          href={translateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-teal-deep text-white text-[0.78rem] font-medium px-3.5 py-1.5 rounded-full hover:bg-teal-dark transition-colors whitespace-nowrap">
          Translate ↗
        </a>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss translation banner"
          className="w-6 h-6 flex items-center justify-center text-text-xlight hover:text-charcoal transition-colors rounded-full hover:bg-white">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 2l10 10M12 2L2 12"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
