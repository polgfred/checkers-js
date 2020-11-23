var path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/main.js',
    worker: './src/worker.js',
  },
  output: {
    path: __dirname,
    filename: '[name]-bundle.js',
  },
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: [path.resolve(__dirname, 'node_modules')],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'postcss-loader',
        ],
      },
      {
        test: /\.svg$/,
        use: [
          'babel-loader',
          { loader: 'react-svg-loader', options: { jsx: true } },
        ],
      },
    ],
  },
};
