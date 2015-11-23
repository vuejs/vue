var webpack = require('webpack')

module.exports = {
  entry: './src/index',
  output: {
    path: './dist',
    filename: 'vue.js',
    library: 'Vue',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /lib\//
      }
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
  devtool: '#source-map'
}
