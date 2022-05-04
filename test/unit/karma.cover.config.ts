const base = require('./karma.base.config.ts')

process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function (config: any) {
  const options = Object.assign(base, {
    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      'ChromeHeadlessCI': {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    reporters: ['mocha', 'coverage', 'karma-typescript'],
    coverageReporter: {
      reporters: [
        { type: 'lcov', dir: '../../coverage', subdir: '.' },
        { type: 'text-summary', dir: '../../coverage', subdir: '.' }
      ]
    },
    singleRun: true,
    plugins: base.plugins.concat([
      'karma-coverage',
      'karma-chrome-launcher'
    ])
  })

  // add babel-plugin-istanbul for code instrumentation
  options.webpack.module.rules[0].options = {
    plugins: [['istanbul', {
      exclude: [
        'test/',
        'src/compiler/parser/html-parser.ts',
        'src/core/instance/proxy.ts',
        'src/sfc/deindent.ts',
        'src/platforms/weex/'
      ]
    }]]
  }

  config.set(options)
}
