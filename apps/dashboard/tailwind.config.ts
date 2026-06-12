import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // CSS-variable-backed colors — these support the /opacity syntax
        // e.g. text-ink/50, bg-lead/10, border-paper/80
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
        },
        lead: {
          DEFAULT: 'rgb(var(--color-lead) / <alpha-value>)',
        },
        paper: {
          DEFAULT: 'rgb(var(--color-paper) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '20px',
        '2xl':'24px',
      },
      boxShadow: {
        card:       '0 1px 3px rgba(13,13,13,0.08), 0 4px 16px rgba(13,13,13,0.06)',
        'card-hover':'0 2px 8px rgba(13,13,13,0.10), 0 8px 24px rgba(13,13,13,0.10)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.3' },
        },
        'marquee': {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up':   'fade-up 0.25s ease both',
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite',
        'marquee':   'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
