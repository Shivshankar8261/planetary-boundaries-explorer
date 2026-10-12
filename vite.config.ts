import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// NASA GISS does not send CORS headers, so in development requests are proxied
// through Vite. In production the service tries a direct fetch and falls back
// to the bundled snapshot (see src/services/gistemp.ts).
export default defineConfig({
  plugins: [react()],
  build: {
    // Single app chunk: manual vendor splitting broke React initialisation order in production.
    chunkSizeWarningLimit: 1200,
  },
  server: {
    proxy: {
      '/proxy/gistemp': {
        target: 'https://data.giss.nasa.gov',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/gistemp/, '/gistemp/tabledata_v4'),
      },
    },
  },
});
