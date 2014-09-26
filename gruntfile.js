var sauceConfig = require('./grunt/sauce')

module.exports = function (grunt) {

  var version = grunt.file.readJSON('package.json').version
  var banner =
    '/**\n' +
    ' * Vue.js v' + version + '\n' +
    ' * (c) ' + new Date().getFullYear() + ' Evan You\n' +
    ' * Released under the MIT License.\n' +
    ' */\n'

  grunt.initConfig({

    banner: banner,

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
        src: ['test/unit/specs/**/*.js', 'test/e2e/*.js']
      }
    },

    watch: {
      options: {
        nospawn: true
      },
      dev: {
        files: ['src/**/*.js'],
        tasks: ['dev']
      },
      test: {
        files: ['test/unit/specs/**/*.js'],
        tasks: ['build-test']
      }
    },

    karma: {
      options: {
        frameworks: ['jasmine', 'commonjs'],
        files: [
          'src/**/*.js',
          'test/unit/specs/**/*.js'
        ],
        preprocessors: {
          'src/**/*.js': ['commonjs'],
          'test/unit/specs/**/*.js': ['commonjs']
        },
        singleRun: true
      },
      browsers: {
        options: {
          browsers: ['Chrome', 'Firefox'],
          reporters: ['progress']
        }
      },
      coverage: {
        options: {
          browsers: ['PhantomJS'],
          reporters: ['progress', 'coverage'],
          preprocessors: {
            'src/**/*.js': ['commonjs', 'coverage'],
            'test/unit/specs/**/*.js': ['commonjs']
          },
          coverageReporter: {
            reporters: [
              { type: 'lcov' },
              { type: 'text-summary' }
            ]
          }
        }
      },
      sauce1: {
        options: sauceConfig.batch1
      },
      sauce2: {
        options: sauceConfig.batch2
      },
      sauce3: {
        options: sauceConfig.batch3
      }
    }

  })
  
  // load npm tasks
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-karma')

  // load custom tasks
  grunt.file.recurse('grunt/tasks', function (path) {
    require('./' + path)(grunt)
  })

  grunt.registerTask('unit', ['karma:browsers'])
  grunt.registerTask('cover', ['karma:coverage'])
  grunt.registerTask('test', ['unit', 'cover', 'casper'])
  grunt.registerTask('sauce', ['karma:sauce1', 'karma:sauce2', 'karma:sauce3'])
  grunt.registerTask('ci', ['jshint', 'test', 'sauce'])
  grunt.registerTask('default', ['jshint', 'test', 'build'])

}