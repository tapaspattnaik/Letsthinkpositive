export function LtpLogo({ size = 54 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="letsthinkpositive logo">
      <circle cx="27" cy="27" r="26" stroke="rgba(168,216,208,0.3)" strokeWidth="1" />
      <circle cx="27" cy="27" r="20" stroke="rgba(168,216,208,0.42)" strokeWidth="1" />
      <circle cx="27" cy="27" r="14" stroke="rgba(168,216,208,0.55)" strokeWidth="1" />
      <circle cx="27" cy="27" r="11.5" fill="url(#ltpGrad)" />
      <circle cx="27" cy="27" r="8.5" fill="#2D9B8A" />
      <rect x="22" y="6" width="2.8" height="10" rx="1.4" fill="#E8A020" />
      <rect x="25.6" y="3" width="2.8" height="14" rx="1.4" fill="#E8A020" />
      <rect x="29.2" y="6" width="2.8" height="10" rx="1.4" fill="#E8A020" />
      <path d="M17.5 31.5 Q27 25 36.5 31.5" stroke="#E8A020" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M20.5 34.5 Q27 29.5 33.5 34.5" stroke="#E8A020" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M23.5 37 Q27 34 30.5 37" stroke="#E8A020" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      <circle cx="27" cy="27" r="3.2" fill="rgba(255,248,236,0.92)" />
      <defs>
        <radialGradient id="ltpGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2D9B8A" />
          <stop offset="100%" stopColor="#1A6B6B" />
        </radialGradient>
      </defs>
    </svg>
  )
}
