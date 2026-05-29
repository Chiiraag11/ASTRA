import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/scan-apk': 'http://localhost:8000',
      '/scan-url':  'http://localhost:8000',
      '/health':    'http://localhost:8000',
    },
  },
});
