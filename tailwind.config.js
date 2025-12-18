/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tesla: {
          red: '#E31937',
          dark: '#1a1a1a',
          green: '#00D900',
        }
      }
    },
  },
  plugins: [],
}

