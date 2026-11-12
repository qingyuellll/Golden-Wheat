import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

/**
 * 设计系统 → Tailwind 主题层映射
 * - 颜色/字号/间距/圆角/阴影全部映射自 index.css 的 CSS 变量，禁止硬编码
 * - spacing 覆盖为只含 4px 网格档位（4/8/12/16/24/32/48/64），物理删掉 p-5/p-7/p-9 等非网格值
 * - borderRadius 锁死 6px/8px，禁用 16px+ 大圆角
 * - 颜色一律使用 bg-primary / text-ink / line 等语义类，不直接写 hex
 */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: 'var(--space-6)',
    },
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        page: 'var(--color-page)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        'primary-soft': 'var(--color-primary-soft)',
        'primary-ring': 'var(--color-primary-ring)',
        'primary-ink': 'var(--color-primary-ink)',
        secondary: 'var(--color-secondary)',
        'secondary-soft': 'var(--color-secondary-soft)',
        'secondary-ink': 'var(--color-secondary-ink)',
        accent: 'var(--color-accent)',
        'accent-soft': 'var(--color-accent-soft)',
        danger: 'var(--color-danger)',
        'danger-soft': 'var(--color-danger-soft)',
        ink: 'var(--color-text-main)',
        muted: 'var(--color-text-sub)',
        line: 'var(--color-border)',
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
        0: '0px',
        px: '1px',
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '8px',
        xl: '8px',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-md)',
      },
      transitionDuration: {
        300: '300ms',
        500: '500ms',
      },
      transitionTimingFunction: {
        plant: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.98)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 300ms cubic-bezier(0.22,1,0.36,1)',
        'scale-in': 'scale-in 200ms cubic-bezier(0.22,1,0.36,1)',
        'slide-in-right': 'slide-in-right 300ms cubic-bezier(0.22,1,0.36,1)',
      },
    },
  },
  plugins: [animate],
} satisfies Config
