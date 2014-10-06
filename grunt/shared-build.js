/**
 * Shared build function
 */

module.exports = function (grunt, cb) {

  var webpack = require('webpack')
  var banner =
    '/**\n' +
    ' * Vue.js v' + grunt.config.get('version') + '\n' +
    ' * (c) ' + new Date().getFullYear() + ' Evan You\n' +
    ' * Released under the MIT License.\n' +
    ' */\n'

  webpack({
    entry: './src/vue',
    output: {
      path: './dist',
      filename: 'vue.js',
      library: 'Vue',
      libraryTarget: 'umd'
    },
    plugins: [
      new webpack.BannerPlugin(banner, { raw: true })
    ]
  }, cb)

}