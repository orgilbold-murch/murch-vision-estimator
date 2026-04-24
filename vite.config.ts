import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts')) return 'recharts';
          if (id.includes('node_modules/react-router')) return 'router';
          if (id.includes('node_modules/pdfmake')) return 'pdf';
          if (id.includes('node_modules/xlsx')) return 'xlsx';
          return undefined;
        },
      },
    },
  },
});
