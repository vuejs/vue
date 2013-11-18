var fs     = require('fs'),
    path   = require('path')

module.exports = function( grunt ) {

    grunt.initConfig({

        componentbuild: {
            build: {
                options: {
                    name: 'seed',
                    standalone: 'Seed'
                },
                src: '.',
                dest: 'dist'
            },
            test: {
                options: {
                    name: 'seed.test'
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
                        '// Seed.js - v' + require('./package.json').version + '\n' +
                        '// (c) 2013 Evan You\n' +
                        '// https://github.com/yyx990803/seed\n'
                },
                files: {
                    'dist/seed.min.js': 'dist/seed.js'
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

    grunt.registerTask( 'casper', function (id) {
        var done = this.async(),
            file = id ? id + '.js' : ''
        grunt.util.spawn({
            cmd: 'casperjs',
            args: ['test', '--concise', 'specs/' + file],
            opts: {
                stdio: ['ignore', process.stdout, 'ignore'],
                cwd: path.resolve('test/functional')
            }
        }, function (err, res) {
            if (err) grunt.fail.fatal(res.stdout || 'CasperJS test failed')
            grunt.log.writeln(res.stdout)
            done()
        })
    })

    grunt.registerTask( 'jsc', function () {
        var done = this.async()
        grunt.util.spawn({
            cmd: './node_modules/jscoverage/bin/jscoverage',
            args: ['./test/seed.test.js'],
            opts: {
                stdio: 'inherit'
            }
        }, function (err, res) {
            if (err) grunt.fail.fatal(res.stdout || 'Jscoverage instrumentation failed')
            grunt.log.writeln(res.stdout)
            fs.unlinkSync('./test/seed.test.js')
            done()
        })
    })

    grunt.registerTask( 'test', [
        'componentbuild',
        'jsc',
        'mocha',
        'casper'
    ])

    grunt.registerTask( 'default', [
        'jshint',
        'test',
        'uglify'
    ])
    
}