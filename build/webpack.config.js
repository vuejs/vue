var path = require('path')
var alias = require('./alias')

module.exports = {
  entry: path.resolve(__dirname, 'dev-entry.js'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'vue.js',
    library: 'Vue',
    libraryTarget: 'umd'
  },
  resolve: {
    alias: Object.assign({}, alias, {
      entities: './entity-decoder'
    })
  },
  module: {
    loaders: [
      { test: /\.js/, loader: 'babel!eslint', exclude: /node_modules/ }
    ]
  },
  devtool: '#source-map'
}
