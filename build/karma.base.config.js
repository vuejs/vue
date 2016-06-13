var alias = require('./alias')
var webpack = require('webpack')

var webpackConfig = {
  resolve: {
    alias: Object.assign({}, alias, {
      entities: './entity-decoder'
    })
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel!eslint',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    })
  ],
  devtool: '#inline-source-map'
}

// shared config for all unit tests
module.exports = {
  frameworks: ['jasmine'],
  files: [
    '../test/unit/index.js'
  ],
  preprocessors: {
    '../test/unit/index.js': ['webpack', 'sourcemap']
  },
  webpack: webpackConfig,
  webpackMiddleware: {
    noInfo: true
  }
}
