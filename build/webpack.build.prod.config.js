var webpack = require('webpack')

module.exports = {
  entry: './src/vue',
  output: {
    path: './dist',
    filename: 'vue.min.js',
    library: 'Vue',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
}
