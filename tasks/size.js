var fs = require('fs'),
    min = 'dist/vue.min.js',
    gz = 'dist/vue.min.js.gz'

module.exports = function (grunt) {

    grunt.registerTask('size', function () {
        var minSize = (fs.statSync(min).size / 1024).toFixed(2),
            gzSize = (fs.statSync(gz).size / 1024).toFixed(2)
        console.log(
            '\n\x1b[1m\x1b[34m' +
            'File Sizes:'+
            '\x1b[39m\x1b[22m'
        )
        console.log('Min  : ' + minSize + 'kb')
        console.log('Gzip : ' + gzSize + 'kb')
    })

}