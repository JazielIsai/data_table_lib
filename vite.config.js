import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: false,
  esbuild: { jsx: 'automatic' },
  build: {
    lib: {
      entry: 'src/lib.js',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs',
      cssFileName: 'style'
    },
    rolldownOptions: { external: ['react', 'react-dom', 'react/jsx-runtime'] }
  }
});
