var base = require('./karma.base.config.js')

module.exports = function (config) {
  // enable linting during dev
  base.webpack.module.preLoaders = [
    {
      test: /\.js$/,
      loader: 'eslint',
      exclude: /node_modules/
    }
  ]

  config.set(Object.assign(base, {
    browsers: ['Chrome'],
    reporters: ['progress']
  }))
}
