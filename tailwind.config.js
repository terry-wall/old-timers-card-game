/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'card-red': '#dc2626',
        'card-black': '#1f2937',
      },
      fontSize: {
        'xl-senior': ['1.5rem', { lineHeight: '2rem' }],
        '2xl-senior': ['2rem', { lineHeight: '2.5rem' }],
      },
    },
  },
  plugins: [],
}
