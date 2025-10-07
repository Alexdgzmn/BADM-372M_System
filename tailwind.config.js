/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#8EE3EF',
        secondary: '#254E70',
        accent: {
          dark: '#18020C',
          purple: '#37718E',
          light: '#F5F0F6',
        },
      },
      fontFamily: {
        headline: ['"Roboto Condensed"', 'system-ui', 'sans-serif'],
        body: ['Outfit', 'Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
