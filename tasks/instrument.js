var fs = require('vinyl-fs'),
    component = require('gulp-component'),
    jsc = require('jscoverage'),
    map = require('map-stream')

module.exports = function (grunt) {
    grunt.registerTask('instrument', function () {
        fs.src('./component.json')
            .pipe(component.scripts({
                name: 'vue.test-cov'
            }))
            .pipe(map(function (file, cb) {
                file.contents = new Buffer(jsc.process(file.path, file.contents.toString()))
                cb(null, file)
            }))
            .pipe(fs.dest('./test'))
            .on('end', this.async())
    })
}