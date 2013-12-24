var fs = require('fs'),
    zlib = require('zlib'),
    min = 'dist/vue.min.js',
    gz = 'dist/vue.min.js.gz'

module.exports = function (grunt) {

    grunt.registerTask('size', function () {

        var done = this.async()

        fs.createReadStream(min)
            .pipe(zlib.createGzip())
            .pipe(fs.createWriteStream(gz))
            .on('finish', compareSizes)

        function compareSizes () {
            var minSize = (fs.statSync(min).size / 1024).toFixed(2),
                gzSize = (fs.statSync(gz).size / 1024).toFixed(2)
            console.log(
                '\n\x1b[1m\x1b[34m' +
                'File Sizes:'+
                '\x1b[39m\x1b[22m'
            )
            console.log('Min  : ' + minSize + 'kb')
            console.log('Gzip : ' + gzSize + 'kb')
            done()
        }
    })

}