'use strict';

const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const paths = {
  DIR: __dirname,
  SRC: path.resolve(__dirname, 'src'),
  DIST: path.resolve(__dirname, 'dist'),
  TEST: path.resolve(__dirname, 'test')
};

const dev = {
  mode: 'development',
  entry: path.join(paths.SRC, 'index.js'),
  output:{
    path:paths.DIST,
    filename:'fluid-pipe.lib.js',
    library: 'fluid-pipe',
    libraryTarget: 'umd'
  },
  module:{
    rules:[
      {
        test:/\.js$/,
        include:[
          paths.SRC
        ],
        use: ['babel-loader']
      }
    ]
  },
  resolve:{
    modules:['node_modules', paths.DIR]
  },
  devtool:'source-map',
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new CleanWebpackPlugin(['dist']),
    new webpack.HashedModuleIdsPlugin(),
  ]
};

const test = {
  mode: 'development',
  target: 'node', // webpack should compile node compatible code
  devtool: '#inline-cheap-module-source-map',
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  resolve:{
    modules:['node_modules', paths.DIR]
  },
  module:{
    rules:[
      {
        test:/\.js$/,
        include:[paths.TEST, paths.SRC],
        use: ['babel-loader']
      }
    ]
  },
  output:{
    devtoolModuleFilenameTemplate:'[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate:'[absolute-resource-path]?[hash]'
  }
};

module.exports = (env, argv) =>
{
  process.env.BABEL_ENV = env;
  switch(env)
  {
    default:
      process.env.BABEL_ENV = 'development';
      return dev;
    case 'development':
    case 'dev':
      process.env.BABEL_ENV = 'development';
      return dev;
    case 'test':
      process.env.BABEL_ENV = 'test';
      return test;
  }
};
