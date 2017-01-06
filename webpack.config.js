var path = require('path');

module.exports = {
  entry: './build.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  //devtool: 'inline-source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: [ 'babel' ],
        exclude: [ path.resolve(__dirname, 'node_modules') ]
      }
    ]
  }
};
