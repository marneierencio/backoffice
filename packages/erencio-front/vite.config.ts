import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  base: '/backoffice/',
  plugins: [react()],
  resolve: {
    alias: {
      '@backoffice': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3002,
    proxy: {
      '/metadata': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/graphql': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
