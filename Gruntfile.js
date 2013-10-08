module.exports = function( grunt ) {

    var fs = require('fs')

    grunt.initConfig({

        component_build: {
            dev: {
                output: './dist/',
                name: 'seed',
                dev: true,
                sourceUrls: true,
                styles: false,
                verbose: true,
                standalone: true
            },
            build: {
                output: './dist/',
                name: 'seed',
                styles: false,
                standalone: true
            },
            test: {
                output: './test/',
                name: 'seed.test',
                styles: false
            }
        },

        jshint: {
            build: {
                src: ['src/**/*.js'],
                options: {
                    jshintrc: './.jshintrc'
                }
            },
            test: {
                src: ['test/e2e/**/*.js', 'test/unit/**/*.js'],
                options: {
                    jshintrc: 'test/.jshintrc'
                }
            }
        },

        mocha: {
            unit: {
                src: ['test/unit/*.html'],
                options: {
                    reporter: 'Spec',
                    run: true
                }
            },
            e2e: {
                src: ['test/e2e/*.html'],
                options: {
                    reporter: 'Spec',
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
                    'dist/seed.min.js': 'dist/seed.js'
                }
            }
        },

        watch: {
            options: {
                livereload: true
            },
            component: {
                files: ['src/**/*.js', 'component.json'],
                tasks: ['component_build:dev', 'component_build:test']
            }
        }

    })

    grunt.loadNpmTasks( 'grunt-contrib-watch' )
    grunt.loadNpmTasks( 'grunt-contrib-jshint' )
    grunt.loadNpmTasks( 'grunt-contrib-uglify' )
    grunt.loadNpmTasks( 'grunt-component-build' )
    grunt.loadNpmTasks( 'grunt-mocha' )
    grunt.registerTask( 'test', ['component_build:test', 'mocha'] )
    grunt.registerTask( 'default', [
        'jshint',
        'component_build:build',
        'test',
        'uglify'
    ])

    grunt.registerTask( 'version', function (version) {
        ;['package', 'bower', 'component'].forEach(function (file) {
            file = './' + file + '.json'
            var json = fs.readFileSync(file, 'utf-8')
            json = json.replace(/"version"\s*:\s*"(.+?)"/, '"version": "' + version + '"')
            fs.writeFileSync(file, json)
        })
    })

    grunt.registerTask( 'release', function (version) {
        grunt.task.run(['default', 'version:' + version])
    })
    
}