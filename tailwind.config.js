/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#a855f7',
        accent: {
          dark: '#1e1b4b',
          purple: '#8b5cf6',
          light: '#faf5ff',
          gold: '#fbbf24',
          orange: '#f97316',
          cyan: '#06b6d4',
          pink: '#ec4899',
        },
        game: {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          highlight: '#3b82f6',
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
        'glow': '0 0 20px rgba(99, 102, 241, 0.5)',
        'glow-lg': '0 0 30px rgba(99, 102, 241, 0.6)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
