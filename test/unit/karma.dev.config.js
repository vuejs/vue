var base = require('./karma.base.config.js')

module.exports = function (config) {
  config.set(Object.assign(base, {
    browsers: ['ChromeHeadless'],
    reporters: ['progress'],
    plugins: base.plugins.concat([
      'karma-chrome-launcher'
    ])
  }))
}
