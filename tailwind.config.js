/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-button': 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
        'gradient-button-hover': 'linear-gradient(45deg, #ee5a24, #e17055)',
        'gradient-upload': 'linear-gradient(45deg, #4facfe, #00f2fe)',
        'gradient-counter': 'linear-gradient(45deg, #667eea, #764ba2)',
        'gradient-modal': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-progress': 'linear-gradient(45deg, #00f2fe, #4facfe)',
        'gradient-alert': 'linear-gradient(45deg, #e74c3c, #c0392b)',
        'gradient-navbar': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-title': 'linear-gradient(45deg, #ff6b6b, #ee5a24, #ffa726)',
      },
      boxShadow: {
        'glow-red': '0 6px 20px rgba(255, 107, 107, 0.4)',
        'glow-red-hover': '0 8px 25px rgba(255, 107, 107, 0.6)',
        'glow-blue': '0 6px 20px rgba(79, 172, 254, 0.4)',
        'glow-blue-hover': '0 8px 25px rgba(79, 172, 254, 0.6)',
        'glow-purple': '0 4px 15px rgba(102, 126, 234, 0.3)',
        'card': '0 20px 40px rgba(0, 0, 0, 0.1)',
        'modal': '0 20px 40px rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'progress': 'progress-animation 2s linear infinite',
        'fadeIn': 'fadeIn 0.6s ease-out',
      },
      keyframes: {
        'progress-animation': {
          '0%': { 'background-position': '0 0' },
          '100%': { 'background-position': '30px 0' },
        },
        'fadeIn': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
