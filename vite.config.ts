
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      'pixi-live2d-display/cubism4': path.resolve(__dirname, 'node_modules/pixi-live2d-display/dist/cubism4.js'),
    },
  },
  optimizeDeps: {
    include: ['pixi.js', 'pixi-live2d-display'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  }
});
