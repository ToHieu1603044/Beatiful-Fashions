import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api/provinces': {
        target: 'https://provinces.open-api.vn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/provinces/, '/api/p'),
      },
    },
  },
});
