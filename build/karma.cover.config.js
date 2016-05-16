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

  // add babel-plugin-__coverage__ for code intrumentation
  options.webpack.babel = {
    plugins: [['__coverage__', {
      ignore: [
        'test/',
        'src/compiler/parser/html-parser.js',
        'src/core/instance/proxy.js'
      ]
    }]]
  }

  config.set(options)
}
