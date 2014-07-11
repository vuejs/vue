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
        if (mod === 'run.js') return
        console.log('\n' + mod.slice(0, -3).toUpperCase() + '\n')
        require('../benchmarks/' + mod)
      })

  })
}