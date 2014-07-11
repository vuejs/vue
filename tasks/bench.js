/**
 * Run benchmarks in Node
 */

module.exports = function (grunt) {
  grunt.registerTask('bench', function () {

    // polyfill window/document for old Vue
    global.window = {
      setTimeout: setTimeout,
      console: console
    }
    global.document = {
      documentElement: {}
    }

    require('fs')
      .readdirSync('./benchmarks')
      .forEach(function (mod) {
        if (mod === 'browser.js' || mod === 'runner.html') return
        require('../benchmarks/' + mod)
      })

  })
}