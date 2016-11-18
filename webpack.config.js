const webpack = require('webpack');
const path = require('path');

module.exports =
{
  entry:['./src/root.js'],
  output:
  {
    filename:'fluid-pipe.js',
    path:path.resolve(__dirname, 'dist'),
    library:'fluid-pipe',
    libraryTarget:'umd',
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