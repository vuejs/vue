var fs = require('fs')

module.exports = function (grunt) {
    grunt.registerTask( 'jsc', function () {
        var done = this.async()
        grunt.util.spawn({
            cmd: './node_modules/jscoverage/bin/jscoverage',
            args: ['./test/vue.test.js'],
            opts: {
                stdio: 'inherit'
            }
        }, function (err, res) {
            if (err) grunt.fail.fatal(res.stdout || 'Jscoverage instrumentation failed')
            grunt.log.writeln(res.stdout)
            fs.unlinkSync('./test/vue.test.js')
            done()
        })
    })
}