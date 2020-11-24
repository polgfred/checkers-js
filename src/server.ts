import http = require('http');
import express = require('express');
import webpack = require('webpack');

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import WebpackDevMiddleware = require('webpack-dev-middleware');

import webpack_config = require('../webpack.config');

// set up the express server
const app = express();
app.use(express.static('.'));

// wire up webpack hot module replacement
const compiler = webpack(webpack_config as webpack.Configuration);
app.use(WebpackDevMiddleware(compiler));

// create the server
const server = http.createServer(app);

// listen to incoming requests
server.listen(8080, () => {
  // eslint-disable-next-line no-console
  console.log('listening on http://localhost:8080/');
});
