/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        surface: '#0A0A0A',
        border: '#00FF00', // Neon green border for retro feel
        accent: '#00FF00', // Neon green
        'accent-2': '#FF00FF', // Magenta
        warning: '#FFB000', // Amber
        text: '#00FF00', // Neon green text
        muted: '#008800',
        cyan: '#00FFFF', // Cyan
      },
      fontFamily: {
        display: ['"Courier New"', 'Courier', 'monospace'],
        body: ['"Courier New"', 'Courier', 'monospace'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      }
    },
  },
  plugins: [],
}
