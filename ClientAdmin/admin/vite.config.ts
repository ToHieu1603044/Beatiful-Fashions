import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api/provinces': {
        target: 'https://provinces.open-api.vn/api/p',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/provinces/, ''),
      },
      '/api/districts': {
        target: 'https://provinces.open-api.vn/api/d',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/districts/, ''),
      },
    },
  },
});
