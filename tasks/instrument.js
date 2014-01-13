var fs = require('vinyl-fs'),
    component = require('gulp-component')

module.exports = function (grunt) {
    grunt.registerTask('instrument', function () {
        fs.src('./component.json')
            .pipe(component.scripts({
                name: 'vue.test'
            }))
            .pipe(fs.dest('./test'))
            .on('end', this.async())
    })
}