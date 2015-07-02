module.exports = function (grunt) {

  grunt.registerTask('codecov', function () {
    var done = this.async()
    var sendToCodeCov = require('codecov.io/lib/sendToCodeCov.io.js')
    var coverage = require('fs').readFileSync('coverage/lcov.info', 'utf-8')
    sendToCodeCov(coverage, function (err) {
      if (err) {
        console.log('error sending to codecov.io: ', err, err.stack)
        if (/non-success response/.test(err.message)) {
          console.log('detail: ', err.detail)
        }
      }
      done()
    })
  })

}
