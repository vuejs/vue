/**
 * Build `test/unit/specs.js` which is used in
 * `test/unit/runner.html`
 */

module.exports = function (grunt) {
  grunt.registerTask('build-test', function () {
    var webpack = require('webpack')
    var files = grunt.file.expand(['test/unit/specs/**/*.js'])
      .map(function (file) {
        return './' + file
      })
    webpack({
      entry: files,
      output: {
        path: './test/unit',
        filename: 'specs.js'
      }
    }, this.async())
  })
}