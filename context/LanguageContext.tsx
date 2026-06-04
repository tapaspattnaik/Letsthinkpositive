'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { LANG_STORAGE_KEY } from '@/lib/languages'

interface LanguageContextValue {
  language: string
  setLanguage: (code: string) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  language:    'en',
  setLanguage: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState('en')

  useEffect(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    if (saved) setLang(saved)
  }, [])

  const setLanguage = useCallback((code: string) => {
    setLang(code)
    localStorage.setItem(LANG_STORAGE_KEY, code)
  }, [])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
