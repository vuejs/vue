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
  webpack: {
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /test|node_modules|lib\//,
          loader: 'babel?optional[]=runtime&loose=all'
        }
      ]
    }
  },
  webpackMiddleware: {
    noInfo: true
  },
  singleRun: true
}
