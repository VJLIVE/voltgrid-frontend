/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        volt: {
          bg: '#07090f',
          surface: '#0d1117',
          card: '#0f1624',
          border: '#1e2d3d',
          blue: '#2563eb',
          'blue-light': '#3b82f6',
          green: '#34d399',
          red: '#ef4444',
          amber: '#f59e0b',
          text: '#f1f5f9',
          muted: '#64748b',
        },
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'grid-lines': "linear-gradient(to right, #1e2d3d22 1px, transparent 1px), linear-gradient(to bottom, #1e2d3d22 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '64px 64px',
      },
    },
  },
  plugins: [],
}
