/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      colors: {
        // Paper-and-ink system from the Savings Tracker Redesign canvas.
        paper: {
          DEFAULT: '#EFE9DE', // page ground
          card: '#FFFDF9', // raised surfaces
          sunk: '#F7F3EC', // app/main area behind cards
          rail: '#F0EBE1', // segmented-control track
          line: '#EDE7DC', // progress track
        },
        ink: {
          DEFAULT: '#16130F',
          muted: 'rgba(22,19,15,.66)',
          soft: 'rgba(22,19,15,.5)',
          faint: 'rgba(22,19,15,.45)',
          rule: 'rgba(22,19,15,.1)',
          hairline: 'rgba(22,19,15,.08)',
        },
        accent: {
          DEFAULT: '#3B4CC0',
          hover: '#2B3A9E',
          tint: '#EBEDFA',
          track: '#E7E9F7',
        },
        positive: {
          DEFAULT: '#1E7A57',
          tint: '#E4EEE9',
        },
        negative: {
          DEFAULT: '#B3452B',
          tint: '#F3E3DE',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      spacing: {
        4.5: '1.125rem',
        13: '3.25rem',
        18: '4.5rem',
        sidebar: '15rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.06)',
        fab: '0 4px 14px 0 rgb(79 70 229 / 0.35)',
      },
      maxWidth: {
        app: '72rem',
        content: '90rem',
      },
    },
  },
  plugins: [],
}
