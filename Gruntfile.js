module.exports = function( grunt ) {

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
            }
        },

        jshint: {
            build: {
                src: ['src/**/*.js'],
                options: {
                    jshintrc: "./.jshintrc"
                }
            }
        },

        mocha: {
            build: {
                src: ['test/test.html'],
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
                tasks: ['component_build:dev', 'concat:dev']
            }
        }

    })

    grunt.loadNpmTasks( 'grunt-contrib-watch' )
    grunt.loadNpmTasks( 'grunt-contrib-jshint' )
    grunt.loadNpmTasks( 'grunt-contrib-uglify' )
    grunt.loadNpmTasks( 'grunt-component-build' )
    grunt.loadNpmTasks( 'grunt-mocha' )
    grunt.registerTask( 'test', ['mocha'] )
    grunt.registerTask( 'default', ['jshint', 'component_build:build'] )

    grunt.registerTask( 'version', function (version) {
        var fs = require('fs')
        ;['package', 'bower', 'component'].forEach(function (file) {
            file = './' + file + '.json'
            var json = fs.readFileSync(file, 'utf-8')
            json = json.replace(/"version"\s*:\s*"(.+?)"/, '"version": "' + version + '"')
            fs.writeFileSync(file, json)
        })
    })

    grunt.registerTask( 'release', function (version) {
        grunt.task.run([
            'jshint',
            'component_build:build',
            //'test',
            'uglify',
            'version:' + version
        ])
    })
    
}