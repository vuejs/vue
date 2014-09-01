module.exports = function (grunt) {
  grunt.registerTask('build-test', function () {
    var done = this.async()
    var fs = require('fs')
    var browserify = require('browserify')
    var files = grunt.file.expand(['test/unit/specs/**/*.js'])
      .map(function (file) {
        return './' + file
      })
    browserify(files)
      .bundle()
      .pipe(fs.createWriteStream('test/unit/specs.js'))
      .on('close', done)
  })
}