/**
 * Build and report size.
 */

module.exports = function (grunt) {
  grunt.registerTask('build', function () {

    var done = this.async()
    var fs = require('fs')
    var zlib = require('zlib')
    var webpack = require('webpack')
    var devConfig = require('../webpack.build.dev.config')
    var prodConfig = require('../webpack.build.prod.config')

    // handle version
    var version = require('../../package.json').version

    // add banner
    var banner = new webpack.BannerPlugin(
      'Vue.js v' + version + '\n' +
      '(c) ' + new Date().getFullYear() + ' Evan You\n' +
      'Released under the MIT License.'
    )
    devConfig.plugins.unshift(banner)
    prodConfig.plugins.unshift(banner)

    // update main file
    var main = fs
      .readFileSync('src/vue.js', 'utf-8')
      .replace(/Vue\.version = '[\d\.]+'/, "Vue.version = '" + version + "'")
    fs.writeFileSync('src/vue.js', main)

    // build
    webpack(devConfig, function (err, stats) {
      if (err) return done(err)
      report('dist/vue.js')
      webpack(prodConfig, function (err, stats) {
        if (err) return done(err)
        report('dist/vue.min.js')
        zip()
      })
    })

    function zip () {
      fs.readFile('dist/vue.min.js', function (err, buf) {
        if (err) return done(err)
        zlib.gzip(buf, function (err, buf) {
          if (err) return done(err)
          report('dist/vue.min.js.gz', buf)
          fs.writeFile('dist/vue.min.js.gz', buf, done)
        })
      })
    }

    function report (path, file) {
      if (!file) {
        file = fs.readFileSync(path)
      }
      console.log(
        blue(path + ': ') +
        (file.length / 1024).toFixed(2) + 'kb'
      )
    }

    function blue (str) {
      return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
    }
  })
}
