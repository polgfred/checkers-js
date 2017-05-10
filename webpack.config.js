var path = require('path');

module.exports = {
  entry: {
    main: './src/main.js',
    worker: './src/worker.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]-bundle.js'
  },
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [ 'babel-loader' ],
        exclude: [ path.resolve(__dirname, 'node_modules') ]
      }, {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader?importLoaders=1', 'postcss-loader' ]
      }
    ]
  }
};
