import http from 'node:http';
import process from 'node:process';

import express from 'express';

// set up the express server
const app = express();
app.use(express.static('./static'));

if (process.env.NODE_ENV === 'development') {
  // wire up webpack hot module replacement
  const { default: webpack } = await import('webpack');
  const { default: WebpackDevMiddleware } = await import('webpack-dev-middleware');
  const { default: webpackConfig } = await import('../webpack.config.js');
  // @ts-expect-error config type
  app.use(WebpackDevMiddleware(webpack(webpackConfig)));
}

// create the server
const server = http.createServer(app);

// listen to incoming requests
server.listen(8080, () => {
  // eslint-disable-next-line no-console
  console.log('listening on http://localhost:8080/');
});
