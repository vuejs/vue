/**
 * Run benchmarks in Node
 */

module.exports = function (grunt) {
  grunt.registerTask('bench', function (target) {

    // polyfill window/document for old Vue
    global.window = {
      setTimeout: setTimeout,
      console: console
    }
    global.document = {
      documentElement: {}
    }

    if (target) {
      run(target)
    } else {
      require('fs')
        .readdirSync('./benchmarks')
        .forEach(run)
    }

    function run (mod) {
      if (mod === 'browser.js' || mod === 'runner.html') return
      require('../benchmarks/' + mod)
    }

  })
}