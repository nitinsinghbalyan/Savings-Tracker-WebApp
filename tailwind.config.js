/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        // Each family resolves to RGB channels in a custom property defined in
        // index.css, wrapped so Tailwind's opacity modifiers still work
        // (bg-accent/25, ring-brand-500/20, …). `.dark` overrides the channels.
        //
        // NOTE: `white` is intentionally left as Tailwind's literal. Theming it
        // would fix the ~27 `bg-white` surfaces but simultaneously break the ~33
        // `text-white` labels sitting on accent buttons. Those surfaces use
        // `bg-surface` instead.
        surface: 'rgb(var(--surface) / <alpha-value>)',

        paper: {
          DEFAULT: 'rgb(var(--paper) / <alpha-value>)',
          card: 'rgb(var(--paper-card) / <alpha-value>)',
          sunk: 'rgb(var(--paper-sunk) / <alpha-value>)',
          rail: 'rgb(var(--paper-rail) / <alpha-value>)',
          line: 'rgb(var(--paper-line) / <alpha-value>)',
        },
        // One ink channel triple; the tiers derive from it by alpha, so
        // inverting `--ink` in dark carries every tier with it.
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          muted: 'rgb(var(--ink) / 0.66)',
          soft: 'rgb(var(--ink) / 0.5)',
          faint: 'rgb(var(--ink) / 0.45)',
          rule: 'rgb(var(--ink) / 0.14)',
          hairline: 'rgb(var(--ink) / 0.1)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover) / <alpha-value>)',
          tint: 'rgb(var(--accent-tint) / <alpha-value>)',
          track: 'rgb(var(--accent-track) / <alpha-value>)',
        },
        positive: {
          DEFAULT: 'rgb(var(--positive) / <alpha-value>)',
          tint: 'rgb(var(--positive-tint) / <alpha-value>)',
        },
        negative: {
          DEFAULT: 'rgb(var(--negative) / <alpha-value>)',
          tint: 'rgb(var(--negative-tint) / <alpha-value>)',
        },
        brand: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
        },
        // The legacy neutral ramp, inverted under `.dark`. This is what lets
        // the ~394 un-migrated slate utilities adapt without a rewrite.
        slate: {
          50: 'rgb(var(--slate-50) / <alpha-value>)',
          100: 'rgb(var(--slate-100) / <alpha-value>)',
          200: 'rgb(var(--slate-200) / <alpha-value>)',
          300: 'rgb(var(--slate-300) / <alpha-value>)',
          400: 'rgb(var(--slate-400) / <alpha-value>)',
          500: 'rgb(var(--slate-500) / <alpha-value>)',
          600: 'rgb(var(--slate-600) / <alpha-value>)',
          700: 'rgb(var(--slate-700) / <alpha-value>)',
          800: 'rgb(var(--slate-800) / <alpha-value>)',
          900: 'rgb(var(--slate-900) / <alpha-value>)',
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
        card: 'var(--shadow-card)',
        fab: 'var(--shadow-fab)',
      },
      maxWidth: {
        app: '72rem',
        content: '90rem',
      },
    },
  },
  plugins: [],
}
