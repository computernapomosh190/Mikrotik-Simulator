/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F4FD',
          100: '#D1E9FB',
          200: '#A3D3F7',
          300: '#75BDF3',
          400: '#47A7EF',
          500: '#2E86DE',
          600: '#2569B2',
          700: '#1C4C85',
          800: '#132F58',
          900: '#0D1B2A',
        },
        navy: {
          900: '#0D1B2A',
          800: '#1B263B',
          700: '#2D3E50',
          600: '#3A506B',
        },
        accent: {
          green: '#10AC84',
          orange: '#F39C12',
          purple: '#9B59B6',
          red: '#E74C3C',
          teal: '#1ABC9C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
