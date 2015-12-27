var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './test/unit/specs/index.js',
  output: {
    path: path.resolve(__dirname, '../test/unit'),
    filename: 'specs.js'
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, '../src')
    }
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /test\/unit|node_modules/
      }
    ]
  },
  babel: {
    loose: 'all',
    optional: ['runtime']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    })
  ],
  devServer: {
    contentBase: './test/unit',
    noInfo: true
  },
  devtool: '#source-map'
}
