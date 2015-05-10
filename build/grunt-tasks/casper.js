/**
 * Run e2e tests with CasperJS.
 */

module.exports = function (grunt) {
  grunt.registerTask( 'casper', function (id) {
    var path = require('path')
    var done = this.async()
    var file = id ? id + '.js' : ''
    grunt.util.spawn({
      cmd: 'casperjs',
      args: ['test', '--concise', './' + file],
      opts: {
        stdio: ['ignore', process.stdout, 'ignore'],
        cwd: path.resolve('test/e2e')
      }
    }, function (err, res) {
      if (err) grunt.fail.fatal(res.stdout || 'CasperJS test failed')
      grunt.log.writeln(res.stdout)
      done()
    })
  })
}