var gulp = require('vinyl-fs'),
    component = require('gulp-component')

module.exports = function (grunt) {
    grunt.registerTask('dev', function () {
        gulp.src('./component.json')
            .pipe(component.scripts({
                standalone: 'Vue',
                name: 'vue'
            }))
            .pipe(gulp.dest('./dist'))
            .on('end', this.async())
    })
}