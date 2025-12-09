/* eslint-disable no-console */

import Bun from 'bun';
import frontendBundle from './src/index.html';

// build the worker bundle so we can serve it directly
const workerBuild = await Bun.build({
  entrypoints: ['./src/worker.ts'],
  sourcemap: 'inline',
});
const workerBundle = await workerBuild.outputs[0].text();

const server = Bun.serve({
  development: true,
  port: 8080,
  routes: {
    '/': frontendBundle,
    '/worker.js': new Response(workerBundle, {
      headers: { 'Content-Type': 'application/javascript' },
    }),
  },
});

console.log(`🚀 Server running at ${server.url}`);
