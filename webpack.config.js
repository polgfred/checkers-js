var path = require('path');

var postcssPresetEnv = require('postcss-preset-env');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    main: './src/main.js',
    worker: './src/worker.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
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
    ],
  },
};
