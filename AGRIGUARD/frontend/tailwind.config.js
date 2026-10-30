/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        earth: {
          50: '#fdfbf7',
          100: '#f7f4ea',
          200: '#ede6d1',
          300: '#dfd2b0',
          400: '#cfba8b',
          500: '#bfa068',
          600: '#ad8751',
          700: '#8f6a40',
          800: '#755437',
          900: '#614530',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Tamil', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
