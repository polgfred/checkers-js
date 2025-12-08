/* eslint-disable no-console */

import Bun from 'bun';
import frontendBundle from './src/index.html';
import { analyze } from './src/core/analyzer';

const server = Bun.serve({
  development: true,
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
});

console.log(`🚀 Server running at ${server.url}`);
