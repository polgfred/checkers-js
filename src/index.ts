/* eslint-disable no-console */

import Bun from 'bun';
import frontendBundle from './index.html';
import { analyze } from './core/analyzer';

const server = Bun.serve({
  port: 8080,
  routes: {
    '/': frontendBundle,
    '/move': {
      async POST(request) {
        const { board, side } = await request.json();
        const [move] = analyze(board, side);
        return Response.json(move);
      },
    },
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
