var path = require('path')
var base = require('./karma.base.config.js')

module.exports = function (config) {
  var options = Object.assign(base, {
    browsers: ['PhantomJS'],
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      reporters: [
        { type: 'lcov', dir: '../coverage', subdir: '.' },
        { type: 'text-summary', dir: '../coverage', subdir: '.' }
      ]
    },
    singleRun: true
  })

  // add coverage loader
  options.webpack.module.preLoaders = [
    {
      test: /\.js$/,
      include: path.resolve(__dirname, '../src'),
      loader: 'isparta'
    }
  ]

  config.set(options)
}
