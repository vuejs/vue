var gulp = require('vinyl-fs'),
    component = require('gulp-component'),
    jsc = require('gulp-jscoverage')

module.exports = function (grunt) {
    grunt.registerTask('instrument', function () {
        gulp.src('./component.json')
            .pipe(component.scripts({
                name: 'vue.test'
            }))
            .pipe(jsc())
            .pipe(gulp.dest('./test'))
            .on('end', this.async())
    })
}