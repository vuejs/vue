module.exports = function (grunt) {

  var version = grunt.file.readJSON('package.json').version
  var banner =
    '/**\n' +
    ' * Vue.js v' + version + '\n' +
    ' * (c) ' + new Date().getFullYear() + ' Evan You\n' +
    ' * Released under the MIT License.\n' +
    ' */\n'

  grunt.initConfig({

    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        jshintrc: true
      },
      build: {
        src: ['gruntfile.js', 'tasks/*.js']
      },
      src: {
        src: 'src/**/*.js'
      },
      test: {
        src: 'test/**/*.js'
      }
    },

    karma: {
      options: {
        frameworks: ['jasmine', 'commonjs'],
        files: [
          'src/**/*.js',
          'test/unit/**/*.js'
        ],
        preprocessors: {
          'src/**/*.js': ['commonjs'],
          'test/unit/**/*.js': ['commonjs']
        },
        singleRun: true
      },
      browsers: {
        options: {
          browsers: ['Chrome', 'Firefox'],
          reporters: ['progress']
        }
      },
      phantom: {
        options: {
          browsers: ['PhantomJS'],
          reporters: ['progress']
        }
      }
    },

    browserify: {
      build: {
        src: ['src/vue.js'],
        dest: 'dist/vue.js',
        options: {
          bundleOptions: {
            standalone: 'Vue'
          },
          postBundleCB: function (err, src, next) {
            next(err, banner + src)
          }
        }
      },
      watch: {
        src: ['src/vue.js'],
        dest: 'dist/vue.js',
        options: {
          watch: true,
          keepAlive: true,
          bundleOptions: {
            standalone: 'Vue'
          }
        }
      },
      bench: {
        src: ['benchmarks/*.js', '!benchmarks/browser.js'],
        dest: 'benchmarks/browser.js'
      }
    },

    uglify: {
      build: {
        options: {
          banner: banner,
          compress: {
            pure_funcs: [
                '_.log',
                '_.warn',
                'enableDebug'
            ]
          }
        },
        files: {
          'dist/vue.min.js': ['dist/vue.js']
        }
      }
    }

  })
  
  // load npm tasks
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-karma')
  grunt.loadNpmTasks('grunt-browserify')

  // load custom tasks
  grunt.file.recurse('tasks', function (path) {
    require('./' + path)(grunt)
  })

  grunt.registerTask('unit', ['karma:browsers'])
  grunt.registerTask('phantom', ['karma:phantom'])
  grunt.registerTask('watch', ['browserify:watch'])
  grunt.registerTask('build', ['browserify:build', 'uglify:build'])

}