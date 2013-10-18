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
                standalone: 'Seed'
            },
            build: {
                output: './dist/',
                name: 'seed',
                styles: false,
                standalone: 'Seed'
            },
            test: {
                output: './dist/',
                name: 'seed.test',
                styles: false
            }
        },

        jshint: {
            dev: {
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
                    mangle: true,
                    banner:
                        '// Seed.js ' + require('./package.json').version + '\n' +
                        '// (c) 2013 Evan You\n' +
                        '// https://github.com/yyx990803/seed\n'
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
        'jshint:dev',
        'component_build:build',
        'jshint:test',
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
        if (!version || !isValid(version)) {
            return grunt.fail.warn('Must provide a valid semver version number.')
        }
        grunt.task.run(['version:' + version, 'default'])

        function isValid (v) {
            var nums = v.split('.')
            if (nums.length !== 3) return false
            var current = require('./package.json').version.split('.'),
                a1 = +nums[0],
                b1 = +nums[1],
                c1 = +nums[2],
                a2 = +current[0],
                b2 = +current[1],
                c2 = +current[2]
            if (a1 < a2) return false
            if (a1 === a2 && b1 < b2) return false
            if (a1 === a2 && b1 === b2 && c1 < c2) return false
            return true
        }
    })
    
}