var webpackConfig = require('./webpack.test.config')
delete webpackConfig.entry
delete webpackConfig.devtool

// shared config for all unit tests
module.exports = {
  frameworks: ['jasmine'],
  files: [
    '../test/unit/lib/jquery.js',
    '../test/unit/specs/index.js'
  ],
  preprocessors: {
    '../test/unit/specs/index.js': ['webpack']
  },
  webpack: webpackConfig,
  webpackMiddleware: {
    noInfo: true
  },
  singleRun: true
}
