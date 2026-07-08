/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22C55E', // Fresh Green
          light: '#86EFAC',   // Soft Green
        },
        accent: {
          orange: '#F59E0B',
          brown: '#8B5E3C',
        },
        base: {
          cream: '#F8FAF5',   // Light Cream
          white: '#FFFFFF',
          gray: '#E5E7EB',    // Soft Gray
        },
        text: {
          dark: '#1F2937',    // Dark Gray
          medium: '#6B7280',  // Medium Gray
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
