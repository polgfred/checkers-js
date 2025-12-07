/* eslint-disable no-console */

import Bun from 'bun';
import frontendBundle from './index.html';

// bundle the worker script (won't hot reload)
const {
  outputs: [output],
} = await Bun.build({
  entrypoints: ['./src/worker.ts'],
});

const workerBundle = await output.text();

const server = Bun.serve({
  port: 8080,
  routes: {
    '/': frontendBundle,
    '/worker.js': new Response(workerBundle, {
      headers: { 'Content-Type': 'application/javascript' },
    }),
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
