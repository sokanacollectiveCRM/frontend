import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3001,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "src"),
    }
  }
})
