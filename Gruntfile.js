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

        connect: {
            test: {
                options: {
                    base: '',
                    port: 9999
                }
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
        },

        coveralls: {
            options: {
                coverage_dir: 'coverage/'
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

        'saucelabs-mocha': {
            test: {
                options: {
                    urls: ['http://127.0.0.1:9999/test/unit/runner.html'],
                    build: process.env.TRAVIS_JOB_ID || Date.now(),
                    testname: "unit tests",
                    concurrency: 3,
                    browsers: [
                        {
                            browserName: "chrome",
                            version: "31",
                            platform: "Windows 7"
                        },
                        {
                            browserName: "firefox",
                            version: "26",
                            platform: "Windows 7"
                        },
                        {
                            browserName: "internet explorer",
                            platform: "Windows 7",
                            version: "9"
                        },
                        {
                            browserName: "internet explorer",
                            platform: "Windows 8",
                            version: "10"
                        },
                        {
                            browserName: "internet explorer",
                            platform: "Windows 8.1",
                            version: "11"
                        },
                        {
                            browserName: "safari",
                            platform: "OS X 10.8",
                            version: "6"
                        },
                        {
                            browserName: "safari",
                            platform: "OS X 10.9",
                            version: "7"
                        },
                        {
                            browserName: "iphone",
                            platform: "OS X 10.8",
                            version: "6.0"
                        },
                        {
                            browserName: "iphone",
                            platform: "OS X 10.9",
                            version: "7"
                        }
                    ]
                }
            }
        }

    })

    grunt.loadNpmTasks('grunt-karma')
    grunt.loadNpmTasks('grunt-karma-coveralls')
    grunt.loadNpmTasks('grunt-saucelabs')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-contrib-jshint')
    grunt.loadNpmTasks('grunt-contrib-connect')

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

    grunt.registerTask( 'sauce', [
        'connect',
        'saucelabs-mocha'
    ])

    grunt.registerTask( 'travis', [
        'build',
        'instrument',
        'karma:phantom',
        'coveralls',
        'casper',
        'sauce'
    ])

    grunt.registerTask( 'default', [
        'jshint',
        'build',
        'test'
    ])
    
}