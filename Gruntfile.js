module.exports = function( grunt ) {

    grunt.initConfig({

        version: grunt.file.readJSON('package.json').version,

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
                    mangle: true
                },
                files: {
                    'dist/vue.min.js': 'dist/vue.js'
                }
            }
        },

        watch: {
            options: {
                nospawn: true
            },
            dev: {
                files: ['src/**/*.js', './component.json'],
                tasks: ['componentbuild', 'jsc']
            }
        }

    })

    // load npm tasks
    require('load-grunt-tasks')(grunt)

    // load custom tasks
    grunt.file.recurse('tasks', function (path) {
        require('./' + path)(grunt)
    })

    grunt.registerTask( 'dist', [
        'uglify',
        'banner',
        'size'
    ])

    grunt.registerTask( 'build', [
        'componentbuild:build',
        'dist'
    ])

    grunt.registerTask( 'unit', [
        'componentbuild:test',
        'jsc',
        'mocha'
    ])

    grunt.registerTask( 'test', [
        'unit',
        'componentbuild:build',
        'casper'
    ])

    grunt.registerTask( 'default', [
        'jshint',
        'test',
        'dist'
    ])
    
}