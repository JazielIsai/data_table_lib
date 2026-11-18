import { defineConfig } from 'vite';

export default defineConfig({
  root: 'site',
  base: '/data_table_lib/',
  publicDir: false,
  esbuild: { jsx: 'automatic' },
  build: {
    outDir: '../site-dist',
    emptyOutDir: true
  }
});
