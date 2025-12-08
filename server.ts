/* eslint-disable no-console */

import Bun from 'bun';
import serveStatic from 'serve-static-bun';
import { analyze } from './src/core/analyzer';

const server = Bun.serve({
  development: false,
  port: 8080,
  routes: {
    '/*': serveStatic('dist'),
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
