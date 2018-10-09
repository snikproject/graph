import path from 'path';

export default {
  entry: path.join(__dirname, 'js/main.js'),
  output: {
    path: path.join(__dirname, 'target'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [{
      test: /\.js/,
      exclude: /(node_modules|bower_components)/,
      use: [{
        loader: 'babel-loader',
      }],
    }],
  },
  stats: {
    colors: true,
  },
  mode: 'development',
  devtool: 'source-map',
};
