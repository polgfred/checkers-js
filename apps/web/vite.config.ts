import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [preact()],
  build: {
    assetsInlineLimit: 0,
  },
  server: {
    host: true,
    port: Number(process.env.PORT ?? '5173'),
  },
});
