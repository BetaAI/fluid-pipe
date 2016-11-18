const webpack = require('webpack');
const path = require('path');

module.exports =
{
  entry:['./lib.js'],
  output:
  {
    filename:'lib.bundle.js',
    path:path.resolve(__dirname, 'dist'),
    publicPath:'/dist/'
  },
  plugins:
  [
    new webpack.NoErrorsPlugin()
  ],
  module:
  {
    loaders:
    [
      {
        test:/\.js?/,
        exclude:[/node_modules/, /styles/],
        include:path.resolve(__dirname, 'src'),
        loader:'babel-loader',
      }
    ]
  },
  devtool:'source-map',
};