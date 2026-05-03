/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 
          50: '#f5f3ff', 
          100: '#ede9fe', 
          500: '#8b5cf6', 
          600: '#7c3aed', // Matches the image purple
          700: '#6d28d9', 
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
