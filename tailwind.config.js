/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#F7F6F3', alt: '#EFEDE7' },
        ink: { DEFAULT: '#1C1B19', soft: '#5B5954' },
        muted: '#8B8880',
        accent: { DEFAULT: '#A87A2E', dark: '#8A6323' },
        concrete: { DEFAULT: '#DAD8D2', dark: '#B7B4AC' },
        dark: { DEFAULT: '#17161A', soft: '#232128' },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
