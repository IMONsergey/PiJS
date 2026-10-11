import { defineConfig } from 'vite';

export default defineConfig({
  base: '/PiJS/',
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: false,
    assetsInlineLimit: 4096,
  },
});
