var fs = require('fs'),
    jsc = require('jscoverage')

module.exports = function (grunt) {
    grunt.registerTask( 'jsc', function () {
        jsc.processFile(
            './test/vue.test.js',
            './test/vue.test-cov.js',
            null, {}
        )
        fs.unlink('./test/vue.test.js', this.async())
    })
}