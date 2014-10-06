/**
 * Build, update component.json, uglify, and report size.
 */

module.exports = function (grunt) {
  grunt.registerTask('build', function () {

    var done = this.async()
    var fs = require('fs')
    var zlib = require('zlib')
    var build = require('../shared-build')
    var uglifyjs = require('uglify-js')
    
    // update component.json first
    var jsRE = /\.js$/
    var component = grunt.file.readJSON('component.json')
    component.scripts = []
    grunt.file.recurse('src', function (file) {
      if (jsRE.test(file)) {
        component.scripts.push(file)
      }
    })
    grunt.file.write('component.json', JSON.stringify(component, null, 2))

    // then build
    build(grunt, function (err) {
      if (err) return done(err)
      var js = fs.readFileSync('dist/vue.js', 'utf-8')
      report('dist/vue.js', js)
      // uglify
      var result = uglifyjs.minify(js, {
        fromString: true,
        output: {
          comments: /License/
        },
        compress: {
          pure_funcs: [
            'require',
            '_.log',
            '_.warn',
            '_.assertAsset',
            'enableDebug'
          ]
        }
      })
      // var min = grunt.config.get('banner') + result.code
      write('dist/vue.min.js', result.code)
      // report gzip size
      zlib.gzip(result.code, function (err, buf) {
        write('dist/vue.min.js.gz', buf)
        done(err)
      })
    })

    function write (path, file) {
      fs.writeFileSync(path, file)
      report(path, file)
    }

    function report (path, file) {
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