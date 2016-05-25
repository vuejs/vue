var path = require('path')
var alias = require('./alias')

module.exports = {
  entry: path.resolve(__dirname, 'ssr.dev.entry.js'),
  target: 'node',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'server-renderer.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    alias: alias
  },
  module: {
    loaders: [
      {
        test: /\.js/,
        loader: 'babel!eslint',
        exclude: /node_modules/
      }
    ]
  }
}
