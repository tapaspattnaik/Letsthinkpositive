'use client'

import { useState, useRef, useEffect } from 'react'
import { LANGUAGES } from '@/lib/languages'
import { useLanguage } from '@/context/LanguageContext'

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const [pageUrl, setPageUrl] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const current = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0]

  useEffect(() => {
    setPageUrl(window.location.href)
  }, [])

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const googleTranslateUrl = `https://translate.google.com/translate?sl=en&tl=${language !== 'en' ? language : 'hi'}&u=${encodeURIComponent(pageUrl)}`

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Change language"
        aria-label="Select language"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-teal-light hover:border-teal-mid hover:bg-teal-ghost transition-all text-[0.8rem] text-text-mid">
        <span className="text-[1rem] leading-none">{current.flag}</span>
        <span className="hidden sm:inline font-medium">{current.label}</span>
        <svg className={`w-3 h-3 text-text-xlight transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 4l4 4 4-4"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lift border border-gray-100 overflow-hidden z-[200]">

          {/* AI chat language */}
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[0.63rem] font-bold text-text-xlight tracking-widest uppercase">AI chat language</p>
            <p className="text-[0.6rem] text-text-xlight mt-0.5">Coach, Bit & Reframer respond in this language</p>
          </div>
          <div className="max-h-56 overflow-y-auto py-1.5">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors
                  ${language === lang.code
                    ? 'bg-teal-ghost text-teal-deep'
                    : 'text-text-mid hover:bg-gray-50'}`}>
                <span className="text-[1rem]">{lang.flag}</span>
                <div>
                  <p className="text-[0.82rem] font-medium leading-none">{lang.label}</p>
                  {lang.code !== 'en' && (
                    <p className="text-[0.67rem] text-text-xlight mt-0.5">{lang.english}</p>
                  )}
                </div>
                {language === lang.code && (
                  <svg className="w-3 h-3 text-teal-deep ml-auto flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 8l4 4 8-8"/>
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Google Translate for static pages */}
          <div className="px-3 py-2.5 border-t border-gray-100 bg-gray-50/80">
            <p className="text-[0.62rem] text-text-xlight mb-1.5 font-medium">Translate this whole page</p>
            <a
              href={googleTranslateUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-[0.78rem] text-teal-deep hover:text-teal-dark font-medium transition-colors">
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
              </svg>
              Open in Google Translate ↗
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
