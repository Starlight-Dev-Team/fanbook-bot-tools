import { readFileSync } from 'fs';
import { resolve } from 'path';

export default defineNuxtConfig({
  ssr: false,
  modules: [
    [
      '@pinia/nuxt',
      {
        autoImports: [
          'defineStore',
        ],
      },
    ],
  ],
  devServer: {
    https: {
      key: readFileSync(resolve(__dirname, './https/cert.key')).toString(),
      cert: readFileSync(resolve(__dirname, './https/cert.crt')).toString(),
    },
  },
});
