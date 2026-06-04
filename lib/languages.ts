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

// System prompt PREFIX for AI routes — placed BEFORE the main prompt so the
// model sees it first and reliably follows it (Llama ignores instructions buried at the end)
export function languageInstruction(langCode: string): string {
  if (!langCode || langCode === 'en') return ''
  const lang = getLanguage(langCode)
  return `[LANGUAGE INSTRUCTION — HIGHEST PRIORITY]
You MUST respond ONLY in ${lang.english} (${lang.label}). This is mandatory.
- Every word of your response must be in ${lang.english}
- Do NOT write any English words or sentences
- Use warm, natural, conversational ${lang.english}
- If you are unsure of a term, use the closest ${lang.english} equivalent
[END LANGUAGE INSTRUCTION]

`
}

// Returns the instruction as a prefix to prepend to system prompts
export function withLanguage(systemPrompt: string, langCode: string): string {
  const instruction = languageInstruction(langCode)
  return instruction ? instruction + systemPrompt : systemPrompt
}
