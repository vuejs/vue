var fs = require('fs')

var bannerText =
    '/*\n' +
    ' VueJS v<%= version %>\n' +
    ' (c) 2013 Evan You\n' +
    ' License: MIT\n' +
    '*/\n'

module.exports = function (grunt) {

    grunt.registerTask('banner', function () {
        var done = this.async(),
            banner = new Buffer(grunt.template.process(bannerText)),
            written = 0
        addBanner('dist/vue.js', banner, next)
        addBanner('dist/vue.min.js', banner, next)
        function next () {
            if (written) return done()
            written++
        }
    })

    function addBanner (file, banner, next) {
        fs.readFile(file, function (err, buf) {
            fs.writeFile(file, Buffer.concat([banner, buf]), next)
        })
    }
}