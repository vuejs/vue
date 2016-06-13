var path = require('path')
var alias = require('./alias')

module.exports = {
  entry: path.resolve(__dirname, '../src/entries/web-compiler.js'),
  target: 'node',
  output: {
    path: path.resolve(__dirname, '../packages/vue-template-compiler'),
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    alias: alias
  },
  externals: {
    'entities': true,
    'de-indent': true,
    'source-map': true
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
