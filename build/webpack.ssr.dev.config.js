var path = require('path')
var alias = require('./alias')

module.exports = {
  target: 'node',
  entry: path.resolve(__dirname, 'webpack.ssr.dev.entry.js'),
  target: 'node',
  output: {
    path: path.resolve(__dirname, '../packages/vue-server-renderer'),
    filename: 'create-renderer.js',
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
