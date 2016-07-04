var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './src/index',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'vue.js',
    library: 'Vue',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel' }
    ]
  },
  babel: {
    loose: 'all'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    })
  ],
  devtool: 'source-map'
}
