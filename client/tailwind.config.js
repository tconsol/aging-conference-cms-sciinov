export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: '#1d4ed8', dark: '#1e3a8a', light: '#3b82f6' },
      },
    },
  },
  plugins: [],
};
