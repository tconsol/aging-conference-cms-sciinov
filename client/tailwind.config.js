import typography from '@tailwindcss/typography';

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
  // Every CMS-rendered block uses `prose`. Without this plugin those classes do
  // nothing, and Tailwind's preflight zeroes <p> margins — which is why
  // admin-authored paragraphs ran together with no spacing on the public site.
  plugins: [typography],
};
