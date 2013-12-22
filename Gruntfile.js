var fs     = require('fs'),
    path   = require('path'),
    semver = require('semver')

module.exports = function( grunt ) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        componentbuild: {
            build: {
                options: {
                    name: 'vue',
                    standalone: 'Vue'
                },
                src: '.',
                dest: 'dist'
            },
            test: {
                options: {
                    name: 'vue.test'
                },
                src: '.',
                dest: 'test'
            }
        },

        jshint: {
            options: {
                reporter: require('jshint-stylish'),
                jshintrc: true
            },
            dev: {
                src: ['src/**/*.js']
            },
            test: {
                src: ['test/unit/specs/*.js', 'test/functional/specs/*.js']
            }
        },

        mocha: {
            test: {
                src: ['test/unit/runner.html'],
                options: {
                    log: true,
                    run: true
                }
            }
        },

        uglify: {
            build: {
                options: {
                    compress: true,
                    mangle: true,
                    banner:
                        '/*\n' +
                        ' VueJS v<%= version %>\n' +
                        ' (c) 2013 Evan You\n' +
                        ' License: MIT\n' +
                        '*/\n'
                },
                files: {
                    'dist/vue.min.js': 'dist/vue.js'
                }
            }
        },

        watch: {
            dev: {
                files: ['src/**/*.js', 'component.json'],
                tasks: ['componentbuild', 'jsc']
            }
        }

    })

    grunt.loadNpmTasks( 'grunt-contrib-watch' )
    grunt.loadNpmTasks( 'grunt-contrib-jshint' )
    grunt.loadNpmTasks( 'grunt-contrib-uglify' )
    grunt.loadNpmTasks( 'grunt-component-build' )
    grunt.loadNpmTasks( 'grunt-mocha' )

    grunt.file.recurse('tasks', function (path) {
        require('./' + path)(grunt)
    })

    grunt.registerTask( 'test', [
        'componentbuild',
        'jsc',
        'mocha',
        'casper'
    ])

    grunt.registerTask( 'default', [
        'jshint',
        'test'
    ])
    
}