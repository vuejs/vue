var path = require('path')
var alias = require('./alias')

module.exports = {
  target: 'node',
  entry: path.resolve(__dirname, '../src/entries/web-server-renderer'),
  output: {
    path: path.resolve(__dirname, '../packages/vue-server-renderer'),
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    alias: alias
  },
  externals: {
    'entities': true,
    'lru-cache': true
  },
  module: {
    noParse: /run-in-vm/,
    loaders: [
      {
        test: /\.js/,
        loader: 'babel!eslint',
        exclude: /node_modules/
      }
    ]
  }
}
