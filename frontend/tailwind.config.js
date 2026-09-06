/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans Text"', '"Noto Sans Thai"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        dark: {
          900: '#0b0f19',
          800: '#111827',
          700: '#1f2937',
          600: '#374151'
        },
        burn: {
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c'
        }
      }
    },
  },
  plugins: [],
}
