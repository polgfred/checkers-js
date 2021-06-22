var TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/main.tsx',
    worker: './src/worker.ts',
  },
  output: {
    path: __dirname + '/static',
    filename: '[name]-bundle.js',
  },
  devtool: 'source-map',
  resolve: {
    modules: ['node_modules', 'src'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ts-loader'],
        exclude: [/node_modules/],
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
        use: ['svg-react-loader'],
      },
    ],
  },
  optimization: process.env.WEBPACK_DEV_SERVER
    ? {}
    : {
        minimize: true,
        minimizer: [new TerserPlugin({ extractComments: false })],
      },
};
