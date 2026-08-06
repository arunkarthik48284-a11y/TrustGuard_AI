/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0B0F19',
          card: '#111827',
          border: '#1F2937',
          accent: '#06B6D4', // Cyan
          emerald: '#10B981',
          violet: '#8B5CF6',
          rose: '#F43F5E',
          gold: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
