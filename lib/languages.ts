export interface Language {
  code:   string
  label:  string   // native name
  english: string  // for system prompts
  flag:   string
}

export const LANGUAGES: Language[] = [
  { code: 'en',  label: 'English',    english: 'English',    flag: '🇬🇧' },
  { code: 'es',  label: 'Español',    english: 'Spanish',    flag: '🇪🇸' },
  { code: 'hi',  label: 'हिन्दी',      english: 'Hindi',      flag: '🇮🇳' },
  { code: 'ta',  label: 'தமிழ்',       english: 'Tamil',      flag: '🇮🇳' },
  { code: 'te',  label: 'తెలుగు',      english: 'Telugu',     flag: '🇮🇳' },
  { code: 'bn',  label: 'বাংলা',       english: 'Bengali',    flag: '🇮🇳' },
  { code: 'mr',  label: 'मराठी',       english: 'Marathi',    flag: '🇮🇳' },
  { code: 'kn',  label: 'ಕನ್ನಡ',       english: 'Kannada',    flag: '🇮🇳' },
  { code: 'ml',  label: 'മലയാളം',      english: 'Malayalam',  flag: '🇮🇳' },
  { code: 'gu',  label: 'ગુજરાતી',     english: 'Gujarati',   flag: '🇮🇳' },
  { code: 'pa',  label: 'ਪੰਜਾਬੀ',      english: 'Punjabi',    flag: '🇮🇳' },
]

export function getLanguage(code: string): Language {
  return LANGUAGES.find(l => l.code === code) ?? LANGUAGES[0]
}

export const LANG_STORAGE_KEY = 'ltp_language'

// System prompt suffix for AI routes
export function languageInstruction(langCode: string): string {
  if (!langCode || langCode === 'en') return ''
  const lang = getLanguage(langCode)
  return `\n\nIMPORTANT: You must respond entirely in ${lang.english} (${lang.label}). Do not switch to English at any point. Use natural, warm, conversational ${lang.english}.`
}
