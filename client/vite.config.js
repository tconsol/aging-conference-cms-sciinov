import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Heavy vendors get their own long-lived chunks. They change far less often
// than app code, so returning visitors keep them cached instead of
// re-downloading one large bundle on every deploy.
// Rolldown (Vite 8) requires the function form of manualChunks.
const VENDOR_CHUNKS = [
  ['vendor-react',  ['react-router-dom', 'react-router', 'react-dom', 'react']],
  ['vendor-motion', ['framer-motion']],
  ['vendor-lottie', ['lottie-web', 'lord-icon-element']],
  // lucide-react is deliberately NOT pinned to a chunk: forcing it into one
  // shared bundle pulls every page's icons into the initial load. Left alone,
  // each lazy route only carries the icons it actually imports.
  ['vendor-paypal', ['@paypal/react-paypal-js']],
  ['vendor-forms',  ['react-hook-form', 'react-hot-toast', 'axios']],
];

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    // The only chunk over the default 500 kB is the shared lucide-react icon
    // bundle, and it is lazily loaded rather than part of the initial payload
    // (~129 kB gzipped, cached across deploys). Raised so the warning stays
    // meaningful instead of firing on a known, deliberate exception.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const norm = id.split('\\').join('/');
          if (!norm.includes('/node_modules/')) return;
          // last node_modules segment is the actual package path
          const after = norm.split('/node_modules/').pop();
          for (const [chunk, pkgs] of VENDOR_CHUNKS) {
            // longest names first within each group, so react-router-dom is not
            // swallowed by the shorter `react` prefix
            if (pkgs.some((p) => after === p || after.startsWith(`${p}/`))) return chunk;
          }
        },
      },
    },
  },
});
