/**
 * Open unit tests in real browser.
 */

module.exports = function (grunt) {
  grunt.registerTask('open', function () {
    var path = require('path')
    var exec = require('child_process').exec
    exec('open ' + path.resolve(__dirname, '../../test/unit/runner.html'))
  })
}
