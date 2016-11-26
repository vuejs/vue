var alias = require('./alias')
var webpack = require('webpack')

var webpackConfig = {
  resolve: {
    alias: alias
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __WEEX__: false,
      'process.env': {
        NODE_ENV: '"development"',
        TRANSITION_DURATION: process.env.SAUCE ? 200 : 50,
        TRANSITION_BUFFER: process.env.SAUCE ? 30 : 10
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
