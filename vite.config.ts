import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'log-requests',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url ?? '';
          const time = new Date().toISOString();
          // Log API and page requests (skip noisy static assets like .js, .css, favicon)
          const isApi = url.startsWith('/api');
          const isPage = url === '/' || (url.startsWith('/') && !/\.[a-z0-9]+$/i.test(url.split('?')[0]));
          if (isApi || isPage) {
            console.log(`[${time}] ${req.method} ${url}`);
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 3001,
    clearScreen: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  base: '/'
})
