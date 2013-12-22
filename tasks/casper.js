var path = require('path')

module.exports = function (grunt) {
    grunt.registerTask( 'casper', function (id) {
        var done = this.async(),
            file = id ? id + '.js' : ''
        grunt.util.spawn({
            cmd: 'casperjs',
            args: ['test', '--concise', 'specs/' + file],
            opts: {
                stdio: ['ignore', process.stdout, 'ignore'],
                cwd: path.resolve('test/functional')
            }
        }, function (err, res) {
            if (err) grunt.fail.fatal(res.stdout || 'CasperJS test failed')
            grunt.log.writeln(res.stdout)
            done()
        })
    })
}