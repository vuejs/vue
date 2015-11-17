module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    reporters: ['progress', 'coverage'],
    frameworks: ['jasmine'],
    files: ['../test/unit/specs/index.js', '../test/unit/lib/jquery.js'],
    preprocessors: {
      '../test/unit/specs/index.js': ['webpack']
    },
    webpack: {
      module: {
        loaders: [
          {
            test: /\.js$/,
            exclude: /test|node_modules/,
            loader: 'babel?optional[]=runtime&loose=all'
          }
        ],
        postLoaders: [
          {
            test: /\.js$/,
            exclude: /test|node_modules/,
            loader: 'istanbul-instrumenter'
          }
        ]
      }
    },
    webpackMiddleware: {
      noInfo: true
    },
    singleRun: true,
    coverageReporter: {
      reporters: [
        { type: 'lcov', dir: '../coverage', subdir: '.' },
        { type: 'text-summary', dir: '../coverage', subdir: '.' }
      ]
    }
  })
}
