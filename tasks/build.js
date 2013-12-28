var gulp = require('vinyl-fs'),
    component = require('gulp-component'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    header = require('gulp-header'),
    gzip   = require('gulp-gzip')

var dest = './dist'

var headerTemplate =
    '/*\n' +
    ' VueJS v{{version}}\n' +
    ' (c) 2013 Evan You\n' +
    ' License: MIT\n' +
    '*/'

module.exports = function (grunt) {
    grunt.registerTask('build', function (version) {
        version = version || grunt.config.get('version')
        var headerText = headerTemplate.replace(/{{version}}/, version)
        gulp.src('./component.json')
            .pipe(component.scripts({
                standalone: 'Vue',
                name: 'vue'
            }))
            .pipe(header(headerText))
            .pipe(gulp.dest(dest))
            .pipe(uglify())
            .pipe(header(headerText))
            .pipe(rename('vue.min.js'))
            .pipe(gulp.dest(dest))
            .pipe(gzip())
            .pipe(gulp.dest(dest))
            .on('end', this.async())
    })
}