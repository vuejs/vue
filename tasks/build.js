var fs = require('vinyl-fs'),
    zlib = require('zlib'),
    uglifyjs = require('uglify-js'),
    component = require('gulp-component'),
    map = require('map-stream')

var dest = './dist',
    headerText,
    headerTemplate =
    '/*\n' +
    ' Vue.js v{{version}}\n' +
    ' (c) ' + new Date().getFullYear() + ' Evan You\n' +
    ' License: MIT\n' +
    '*/\n'

module.exports = function (grunt) {
    grunt.registerTask('build', function (version) {

        version = version || grunt.config.get('version')
        headerText = headerTemplate.replace(/{{version}}/, version)

        fs.src('./component.json')
            .pipe(component.scripts({
                standalone: 'Vue',
                name: 'vue'
            }))
            .pipe(map(header))
            .pipe(fs.dest(dest))
            .pipe(map(size))
            .pipe(map(uglify))
            .pipe(map(header))
            .pipe(map(rename))
            .pipe(fs.dest(dest))
            .pipe(map(size))
            .pipe(map(gzip))
            .pipe(fs.dest(dest))
            .pipe(map(size))
            .on('end', this.async())

    })
}

function rename (file, cb) {
    file.path = file.base + '/vue.min.js'
    cb(null, file)
}

function header (file, cb) {
    file.contents = Buffer.concat([new Buffer(headerText), file.contents])
    cb(null, file)
}

function uglify (file, cb) {
    file.contents = new Buffer(uglifyjs.minify(file.contents.toString(), {
        fromString: true,
        compress: {
            pure_funcs: [
                'utils.log',
                'utils.warn',
                'enableDebug',
                'throwError'
            ]
        }
    }).code)
    cb(null, file)
}

function gzip (file, cb) {
    zlib.gzip(file.contents, function (err, buf) {
        file.contents = buf
        file.path = file.path + '.gz'
        cb(err, file)
    })
}

function size (file, cb) {
    console.log(blue(dest + '/' + file.relative + ': ') + (file.contents.length / 1024).toFixed(2) + 'kb')
    cb(null, file)
}

function blue (str) {
    return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}