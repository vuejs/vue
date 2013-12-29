var fs = require('vinyl-fs'),
    component = require('gulp-component')

module.exports = function (grunt) {
    grunt.registerTask('dev', function () {
        fs.src('./component.json')
            .pipe(component.scripts({
                standalone: 'Vue',
                name: 'vue'
            }))
            .pipe(fs.dest('./dist'))
            .on('end', this.async())
    })
}