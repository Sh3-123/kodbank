/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#18191d',
        sidebar: '#1e1f25',
        card: '#24252b',
        accent: '#51d283',
        accentDark: '#3fb26d',
        inputBg: '#1c1c20',
        textMuted: '#8b8e98'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
