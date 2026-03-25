/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      colors: {
        kugie: {
          primary: '#2658B2',
          secondary: '#418EB1',
          accent: '#6DA4D7',
          dark: '#052049',
          light: '#B9D9EB',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        title: ['Calistoga', 'serif'],
      },
      keyframes: {
        slideDown: {
          from: { transform: 'translateY(-100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0) rotate(12deg)' },
          '50%': { transform: 'translateY(-10px) rotate(12deg)' },
        },
      },
      animation: {
        'slide-down': 'slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.6s ease-in',
        'bounce-slow': 'bounceSlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
