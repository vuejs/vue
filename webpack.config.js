var path = require('path')

module.exports = {
  entry: path.resolve(__dirname, 'build/dev-entry.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'vue.js',
    library: 'Vue',
    libraryTarget: 'umd'
  },
  resolve: {
    alias: {
      entities: './entity-decoder'
    }
  },
  module: {
    loaders: [
      { test: /\.js/, loader: 'babel!eslint', exclude: /node_modules/ }
    ]
  },
  devtool: '#source-map'
}
