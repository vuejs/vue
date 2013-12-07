var fs     = require('fs'),
    path   = require('path'),
    semver = require('semver')

module.exports = function( grunt ) {

    grunt.initConfig({

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
                        '// Vue.js - v' + require('./package.json').version + '\n' +
                        '// (c) 2013 Evan You\n' +
                        '// https://github.com/yyx990803/vue\n'
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

    grunt.registerTask( 'version', function (version) {
        if (!version || !semver.valid(version)) {
            return grunt.fail.warn('Invalid semver version.')
        }
        var current = require('./package.json').version
        if (semver.lt(version, current)) {
            return grunt.fail.warn('Version is older than current.')
        }
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
            args: ['./test/vue.test.js'],
            opts: {
                stdio: 'inherit'
            }
        }, function (err, res) {
            if (err) grunt.fail.fatal(res.stdout || 'Jscoverage instrumentation failed')
            grunt.log.writeln(res.stdout)
            fs.unlinkSync('./test/vue.test.js')
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