/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme colors that can be overridden via CSS variables
        primary: 'var(--color-primary, #6366f1)',
        secondary: 'var(--color-secondary, #8b5cf6)',
        accent: 'var(--color-accent, #22d3ee)',
        background: 'var(--color-background, #1a1a2e)',
        surface: 'var(--color-surface, #16213e)',
        'surface-elevated': 'var(--color-surface-elevated, #0f3460)',
        text: 'var(--color-text, #e4e4e7)',
        'text-muted': 'var(--color-text-muted, #a1a1aa)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
