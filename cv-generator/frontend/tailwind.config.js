/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F8FAFC', // Slate 50
        surface: '#FFFFFF',
        border: '#E2E8F0', // Slate 200
        accent: '#4F46E5', // Indigo 600
        'accent-2': '#3B82F6', // Blue 500
        warning: '#F59E0B', // Amber 500
        text: '#0F172A', // Slate 900
        muted: '#64748B', // Slate 500
        cyan: '#06B6D4', // Cyan 500
        success: '#10B981', // Emerald 500
        danger: '#EF4444', // Red 500
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'saas': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'saas-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
      }
    },
  },
  plugins: [],
}
