'use client'

import { useState, useRef, useEffect } from 'react'
import { LANGUAGES } from '@/lib/languages'
import { useLanguage } from '@/context/LanguageContext'

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref  = useRef<HTMLDivElement>(null)

  const current = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0]

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

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
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lift border border-gray-100 overflow-hidden z-[200]">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[0.65rem] font-bold text-text-xlight tracking-widest uppercase">Language</p>
          </div>
          <div className="max-h-64 overflow-y-auto py-1.5">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                  ${language === lang.code
                    ? 'bg-teal-ghost text-teal-deep'
                    : 'text-text-mid hover:bg-gray-50'}`}>
                <span className="text-[1.1rem]">{lang.flag}</span>
                <div>
                  <p className="text-[0.84rem] font-medium leading-none">{lang.label}</p>
                  {lang.code !== 'en' && (
                    <p className="text-[0.68rem] text-text-xlight mt-0.5">{lang.english}</p>
                  )}
                </div>
                {language === lang.code && (
                  <svg className="w-3.5 h-3.5 text-teal-deep ml-auto flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 8l4 4 8-8"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
