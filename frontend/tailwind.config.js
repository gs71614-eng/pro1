/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        surface: '#1e293b',
        primary: '#3b82f6',
        success: '#10b981',
        critical: '#dc2626',
        high: '#ea580c',
        medium: '#d97706',
        low: '#ca8a04',
        none: '#059669'
      }
    },
  },
  plugins: [],
}
