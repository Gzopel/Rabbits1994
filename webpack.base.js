const path = require('path');

module.exports = {
  entry: [
    './views',
  ],

  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js',
    publicPath: '/',
  },

  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js', '.jsx'],
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['babel-loader'],
      }, {
        test: /\.js$/,
        loaders: ['transform?brfs'],
        include: /node_modules/
      },
      {
        test: /\.json$/,
        loaders: ['json']
      }
    ],
  },

  plugins: [],
};
