/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#254E70',
        secondary: '#8EE3EF',
        accent: {
          dark: '#18020C',
          purple: '#37718E',
          light: '#F5F0F6',
          gold: '#fbbf24',
          orange: '#f97316',
        },
        game: {
          bg: '#1a2332',
          card: '#243447',
          border: '#37718E',
          highlight: '#8EE3EF',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
        },
      },
      fontFamily: {
        headline: ['"Roboto Condensed"', 'system-ui', 'sans-serif'],
        body: ['Outfit', 'Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(142, 227, 239, 0.4)',
        'glow-lg': '0 0 30px rgba(142, 227, 239, 0.5)',
        'glow-purple': '0 0 20px rgba(55, 113, 142, 0.5)',
        'glow-gold': '0 0 20px rgba(251, 191, 36, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(142, 227, 239, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(142, 227, 239, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
