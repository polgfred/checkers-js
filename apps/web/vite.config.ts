import { fileURLToPath } from 'node:url';

import preact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const coreSrc = fileURLToPath(
  new URL('../../packages/core/src/index.ts', import.meta.url)
);
const uiSrc = fileURLToPath(
  new URL('../../packages/ui/src/index.ts', import.meta.url)
);

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      '@checkers/core': coreSrc,
      '@checkers/ui': uiSrc,
    },
  },
  build: {
    assetsInlineLimit: 0,
  },
  server: {
    host: true,
    port: Number(process.env.PORT ?? '5173'),
  },
});
