var path = require('path')
var alias = require('./alias')

module.exports = {
  entry: path.resolve(__dirname, '../test/ssr/ssr.spec.js'),
  output: {
    path: path.resolve(__dirname, '../test/ssr'),
    filename: 'ssr.spec.bundle.js'
  },
  resolve: {
    alias: alias
  },
  module: {
    loaders: [
      { test: /\.js/, loader: 'babel', exclude: /node_modules/ }
    ]
  }
}
