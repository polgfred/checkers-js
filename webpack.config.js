// eslint-disable-next-line @typescript-eslint/no-var-requires
var TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV,
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
  optimization:
    process.env.NODE_ENV === 'development'
      ? {}
      : {
          minimize: true,
          minimizer: [new TerserPlugin({ extractComments: false })],
        },
};
