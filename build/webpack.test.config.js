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
        // NOTE: use absolute path to make sure
        // running tests is OK even if it is in node_modules of other project
        exclude: [
          path.resolve(__dirname, '../test/unit'),
          path.resolve(__dirname, '../node_modules')
        ]
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
  devtool: 'source-map'
}
