// eslint-disable-next-line @typescript-eslint/no-var-requires
import path from 'node:path';
import TerserPlugin from 'terser-webpack-plugin';

export default {
  mode: process.env.NODE_ENV,
  entry: {
    main: './src/main.tsx',
    worker: './src/worker.ts',
  },
  output: {
    path: path.resolve('./static'),
    filename: '[name]-bundle.js',
  },
  devtool: 'source-map',
  resolve: {
    modules: ['node_modules', 'src'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js'],
      '.jsx': ['.tsx', '.jsx'],
    },
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
