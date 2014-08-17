var zlib = require('zlib')

module.exports = function (grunt) {
  grunt.registerTask('size', function () {
    var done = this.async()
    zlib.gzip(grunt.file.read('dist/vue.min.js'), function (err, buf) {
      var size = (buf.length / 1024).toFixed(2)
      console.log('gzipped size: ' + size + 'kb')
      done()
    })
  })
}