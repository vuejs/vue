module.exports = function( grunt ) {

    grunt.initConfig({

        version: grunt.file.readJSON('package.json').version,

        jshint: {
            options: {
                reporter: require('jshint-stylish'),
                jshintrc: true
            },
            build: {
                src: ['Gruntfile.js', 'tasks/*.js']
            },
            src: {
                src: 'src/**/*.js'
            },
            test: {
                src: 'test/*/specs/*.js'
            }
        },

        karma: {
            options: {
                frameworks: ['mocha'],
                files: [
                    'test/vue.test.js',
                    'test/unit/utils/chai.js',
                    'test/unit/utils/prepare.js',
                    'test/unit/specs/*.js'
                ],
                singleRun: true
            },
            browsers: {
                options: {
                   browsers: ['Chrome', 'Firefox', 'Safari'],
                   reporters: ['progress']
                }
            },
            phantom: {
                options: {
                    browsers: ['PhantomJS'],
                    reporters: ['progress', 'coverage'],
                    preprocessors: {
                        'test/vue.test.js': ['coverage']
                    },
                    coverageReporter: {
                        reporters: [
                            { type: 'lcov' },
                            { type: 'text-summary' }
                        ]
                    }
                }
            }
        },

        coveralls: {
            options: {
                coverage_dir: 'coverage/'
            }
        },

        watch: {
            options: {
                nospawn: true
            },
            dev: {
                files: ['src/**/*.js', './component.json'],
                tasks: ['dev', 'instrument']
            }
        }

    })

    grunt.loadNpmTasks('grunt-karma')
    grunt.loadNpmTasks('grunt-karma-coveralls')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-contrib-jshint')

    // load custom tasks
    grunt.file.recurse('tasks', function (path) {
        require('./' + path)(grunt)
    })

    grunt.registerTask( 'unit', [
        'instrument',
        'karma:browsers'
    ])

    grunt.registerTask( 'test', [
        'unit',
        'casper'
    ])

    grunt.registerTask( 'default', [
        'jshint',
        'build',
        'test'
    ])

    grunt.registerTask( 'travis', [
        'build',
        'instrument',
        'karma:phantom',
        'casper',
        'coveralls'
    ])
    
}