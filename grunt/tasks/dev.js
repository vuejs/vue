module.exports = function (grunt) {
  grunt.registerTask('dev', function () {
    var done = this.async()
    var fs = require('fs')
    var build = require('../shared-build')
    build(grunt, function (js) {
      fs.writeFileSync('dist/vue.js', js)
      done()
    })
  })
}