'use client'

// ── Phone input with live formatting ────────────────────────────────────────
// Formats as you type: "+1 848 437 1130" / "98765 43210" — digits grouped,
// country code split out, max 15 digits (E.164). Shows a ✓ once the number
// looks complete (10+ digits).

function formatPhone(raw: string): string {
  // Keep only digits and a single leading +
  let v = raw.replace(/[^\d+]/g, '')
  const hasPlus = v.startsWith('+')
  let digits = v.replace(/\+/g, '').slice(0, 15)

  // Country code = whatever precedes the final 10 digits
  let cc = ''
  let rest = digits
  if (digits.length > 10) {
    cc   = digits.slice(0, digits.length - 10)
    rest = digits.slice(-10)
  }

  const groups: string[] = []
  if (rest.length > 6)      groups.push(rest.slice(0, 3), rest.slice(3, 6), rest.slice(6))
  else if (rest.length > 3) groups.push(rest.slice(0, 3), rest.slice(3))
  else if (rest.length)     groups.push(rest)

  const prefix = cc ? `+${cc} ` : hasPlus ? '+' : ''
  return `${prefix}${groups.join(' ')}`
}

export function PhoneInput({
  value, onChange, placeholder = '+91 98765 43210',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const digitCount = value.replace(/\D/g, '').length
  const looksComplete = digitCount >= 10 && digitCount <= 15

  return (
    <div className="relative">
      {/* Phone icon */}
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-mid pointer-events-none">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      </span>

      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={value}
        onChange={e => onChange(formatPhone(e.target.value))}
        placeholder={placeholder}
        className="w-full border border-teal-light rounded-[14px] pl-11 pr-10 py-3 text-[0.95rem] outline-none focus:border-teal-mid bg-ivory transition-colors tracking-[0.08em] [font-variant-numeric:tabular-nums] placeholder:tracking-normal placeholder:text-text-xlight"
      />

      {/* Completeness check */}
      {looksComplete && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-teal-ghost flex items-center justify-center">
          <svg className="w-3 h-3 text-teal-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>
      )}
    </div>
  )
}
