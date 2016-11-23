'use strict';

const webpack = require('webpack');
const path = require('path');

console.log('NODE_ENV', process.env.NODE_ENV);
// console.log('env', env);
let config =
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
    rules:
    [
      {
        test:/\.js?/,
        exclude:[/node_modules/, /styles/],
        include:path.resolve(__dirname, 'src'),
        use:['babel-loader']
      }
    ]
  },
  devtool:'source-map',
};

module.exports = function(env)
{
  console.log('env', env);
  return config;
};