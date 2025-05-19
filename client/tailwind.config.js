/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Correction du double slash
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4ade80',
        secondary: '#0ea5e9',
      },
    },
  },
  plugins: [],
};