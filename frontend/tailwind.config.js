/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-blue': '#1e3a8a',
        'dark-slate': '#334155',
        'emerald-green': '#10b981',
        'soft-gray': '#f8fafc',
        'light-gray': '#f1f5f9',
        'border-gray': '#e2e8f0',
      },
      fontFamily: {
        'fintech': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
