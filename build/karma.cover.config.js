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

  // add babel-plugin-coverage for code intrumentation
  options.webpack.babel = {
    plugins: [['coverage', {
      ignore: [
        'test/',
        'src/compiler/parser/html-parser.js',
        'src/core/instance/proxy.js'
      ]
    }]]
  }

  config.set(options)
}
