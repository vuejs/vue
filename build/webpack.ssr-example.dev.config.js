var path = require('path')
var alias = require('./alias')
var webpack = require('webpack')

module.exports = {
  entry: path.resolve(__dirname, '../examples/commits-ssr/client.js'),
  output: {
    path: path.resolve(__dirname, '../examples/commits-ssr/dist'),
    filename: 'app.js',
    library: 'App',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      { test: /\.js/, loader: 'babel', exclude: /node_modules/ }
    ]
  }
}
