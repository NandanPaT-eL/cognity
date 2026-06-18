import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // CSS-variable-backed — all support the opacity modifier (e.g. bg-purple/10)
        void:   { DEFAULT: 'rgb(var(--color-void)   / <alpha-value>)' },
        canvas: { DEFAULT: 'rgb(var(--color-canvas) / <alpha-value>)' },
        mist:   { DEFAULT: 'rgb(var(--color-mist)   / <alpha-value>)' },
        stone:  { DEFAULT: 'rgb(var(--color-stone)  / <alpha-value>)' },
        purple: { DEFAULT: 'rgb(var(--color-purple) / <alpha-value>)' },
        lilac:  { DEFAULT: 'rgb(var(--color-lilac)  / <alpha-value>)' },
        // Backwards-compat aliases
        ink:    { DEFAULT: 'rgb(var(--color-void)   / <alpha-value>)' },
        accent: { DEFAULT: 'rgb(var(--color-purple) / <alpha-value>)' },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'xl':  '24px',
        '2xl': '32px',
        '3xl': '40px',
      },
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
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
        'fade-up':   'fade-up 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in':   'fade-in 0.2s ease both',
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite',
        'marquee':   'marquee 32s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
