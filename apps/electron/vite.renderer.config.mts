import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    assetsInlineLimit: 0,
  },
  plugins: [react()],
});
