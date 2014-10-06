/**
 * Simple development build to be run with grunt watch.
 */

module.exports = function (grunt) {
  grunt.registerTask('dev', function () {
    require('../shared-build')(grunt, this.async())
  })
}