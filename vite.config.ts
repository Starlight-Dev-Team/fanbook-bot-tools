import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  preview: {
    port: 5543,
  },
  server: {
    port: 5443,
  },
  build: {
    outDir: 'dist',
  },
});
