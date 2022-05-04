const base = require('./karma.base.config.ts')

module.exports = function (config) {
  config.set(Object.assign(base, {
    browsers: ['Chrome', 'Firefox', 'Safari'],
    reporters: ['progress'],
    singleRun: true,
    plugins: base.plugins.concat([
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher'
    ])
  }))
}
