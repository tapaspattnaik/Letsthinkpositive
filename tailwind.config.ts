import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          dark:  '#0F4040',
          deep:  '#1A6B6B',
          mid:   '#2D9B8A',
          light: '#A8D8D0',
          ghost: '#EEF7F6',
        },
        amber: {
          DEFAULT: '#E8A020',
          soft:    '#F5C96A',
          pale:    '#FFF8EC',
        },
        ivory:    '#F8F8F4',
        charcoal: '#1C2B2B',
        'text-mid':    '#2E4A4A',
        'text-light':  '#4A6565',
        'text-xlight': '#7A9898',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        serif:   ['var(--font-dm-serif)', 'Georgia', 'serif'],
        body:    ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        lg:   '24px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(26,107,107,0.10)',
        lift: '0 12px 48px rgba(26,107,107,0.15)',
      },
      animation: {
        'pulse-ring':  'pulse-ring 4s ease-in-out infinite',
        'stroke-glow': 'stroke-glow 2.5s ease-in-out infinite',
        'arc-glow':    'arc-glow 3s ease-in-out infinite',
        'marquee':     'marquee 30s linear infinite',
        'fade-in':     'fade-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':       { opacity: '0.9', transform: 'scale(1.02)' },
        },
        'stroke-glow': {
          '0%, 100%': { opacity: '0.7' },
          '50%':       { opacity: '1' },
        },
        'arc-glow': {
          '0%, 100%': { borderColor: '#E8A020' },
          '50%':       { borderColor: '#F5C96A' },
        },
        'marquee': {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    // Hide scrollbar utility — used in horizontal scroll strips
    function({ addUtilities }: { addUtilities: (u: Record<string, Record<string, string>>) => void }) {
      addUtilities({
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.no-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
      })
    },
  ],
  safelist: [
    'w-[680px]', 'w-[280px]',
    'grid-cols-3', 'grid-cols-4', 'grid-cols-5',
    'columns-1', 'columns-2', 'columns-3',
  ],
}

export default config
