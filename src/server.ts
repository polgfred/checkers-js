import process from 'process';
import http from 'http';
import express from 'express';

// set up the express server
const app = express();
app.use(express.static('./static'));

if (process.env.NODE_ENV === 'development') {
  // wire up webpack hot module replacement
  const { default: webpack } = await import('webpack');
  const { default: WebpackDevMiddleware } = await import('webpack-dev-middleware');
  const { default: config } = await import('../webpack.config.js');
  app.use(WebpackDevMiddleware(webpack(config as any)));
}

// create the server
const server = http.createServer(app);

// listen to incoming requests
server.listen(8080, () => {
  // eslint-disable-next-line no-console
  console.log('listening on http://localhost:8080/');
});
