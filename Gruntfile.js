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
                tasks: ['component_build:dev']
            }
        }

    })

    grunt.loadNpmTasks( 'grunt-contrib-watch' )
    grunt.loadNpmTasks( 'grunt-contrib-jshint' )
    grunt.loadNpmTasks( 'grunt-contrib-uglify' )
    grunt.loadNpmTasks( 'grunt-component-build' )
    grunt.loadNpmTasks( 'grunt-mocha' )
    grunt.registerTask( 'test', ['unit', 'mocha'] )
    grunt.registerTask( 'default', [
        'jshint',
        'component_build:build',
        'test',
        'uglify'
    ])

    grunt.registerTask( 'unit', function () {
        var done = this.async(),
            path = 'test/unit',
            Mocha = require('./node_modules/grunt-mocha/node_modules/mocha'),
            mocha_instance = new Mocha({
                ui: 'bdd',
                reporter: 'spec'
            })
        fs.readdirSync(path).forEach(function (file) {
            mocha_instance.addFile(path + '/' + file)
        })
        mocha_instance.run(function (errCount) {
            var withoutErrors = (errCount === 0)
            done(withoutErrors)
        })
    })

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