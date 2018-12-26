const base = require('./karma.base.config.js')

process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function (config) {
  config.set(Object.assign(base, {
    browsers: ['ChromeHeadless'],
    reporters: ['progress'],
    plugins: base.plugins.concat([
      'karma-chrome-launcher'
    ])
  }))
}
