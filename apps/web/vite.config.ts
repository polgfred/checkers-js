import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    assetsInlineLimit: 0,
  },
  plugins: [react()],
});
