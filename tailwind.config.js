/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
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
