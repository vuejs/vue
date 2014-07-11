module.exports = function (grunt) {

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
        src: 'test/*/specs/*.js'
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
    }

  })
  
  // load npm tasks
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-karma')
  grunt.loadNpmTasks('grunt-browserify')

  // load custom tasks
  grunt.file.recurse('tasks', function (path) {
    require('./' + path)(grunt)
  })

  grunt.registerTask('unit', ['karma:browsers'])
  grunt.registerTask('phantom', ['karma:phantom'])
  grunt.registerTask('watch', ['browserify:watch'])
  grunt.registerTask('build', ['browserify:build'])

}