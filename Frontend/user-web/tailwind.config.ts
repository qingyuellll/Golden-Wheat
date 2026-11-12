import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: 'var(--color-bg-primary)',
        surface: 'var(--color-bg-surface)',
        primary: {
          DEFAULT: 'var(--color-brand-primary)',
          soft: 'rgba(240, 190, 183, 0.12)',
          ring: 'rgba(240, 190, 183, 0.35)',
          ink: 'var(--color-brand-secondary)',
        },
        secondary: {
          DEFAULT: 'var(--color-brand-secondary)',
          soft: 'rgba(79, 96, 53, 0.08)',
          ink: 'var(--color-text-main)',
        },
        accent: {
          DEFAULT: 'var(--color-brand-accent)',
          soft: 'rgba(231, 229, 124, 0.15)',
        },
        ink: 'var(--color-text-main)',
        muted: 'var(--color-text-sub)',
        line: 'var(--color-border)',
        danger: {
          DEFAULT: 'var(--color-danger)',
          soft: 'rgba(220, 38, 38, 0.08)',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Noto Serif SC"', 'ui-serif', 'serif'],
        sans: ['"Source Sans 3"', '-apple-system', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['var(--fs-xs)', { lineHeight: '1.4' }],
        sm: ['var(--fs-sm)', { lineHeight: '1.5' }],
        base: ['var(--fs-base)', { lineHeight: '1.6' }],
        md: ['var(--fs-md)', { lineHeight: '1.4' }],
        lg: ['var(--fs-lg)', { lineHeight: '1.3' }],
        xl: ['var(--fs-xl)', { lineHeight: '1.25' }],
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
      },
      borderRadius: {
        sm: '4px',
        md: 'var(--radius-standard)',
        lg: 'var(--radius-medium)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
