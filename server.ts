/* eslint-disable no-console */

import Bun from 'bun';
import serveStatic from 'serve-static-bun';

const server = Bun.serve({
  development: false,
  port: 8080,
  routes: {
    '/*': serveStatic('dist'),
  },
});

console.log(`🚀 Server running at ${server.url}`);
