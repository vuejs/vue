var path = require('path')
var alias = require('./alias')

module.exports = {
  entry: path.resolve(__dirname, 'webpack.ssr.dev.entry.js'),
  target: 'node',
  output: {
    path: path.resolve(__dirname, '../packages/vue-server-renderer'),
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    alias: alias
  },
  externals: {
    'entities': true
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
