/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'whatsapp-green-dark': '#075E54',
        'whatsapp-green-light': '#25D366',
        'whatsapp-bg': '#ECE5DD',
        'whatsapp-bubble': '#DCF8C6',
      },
    },
  },
  plugins: [],
}

