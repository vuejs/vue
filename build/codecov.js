var sendToCodeCov = require('codecov.io/lib/sendToCodeCov.io.js')

require('fs').readFile('coverage/lcov.info', 'utf-8', function (err, coverage) {
  if (err) throw err
  sendToCodeCov(coverage, function (err) {
    if (err) {
      console.log('error sending to codecov.io: ', err, err.stack)
      if (/non-success response/.test(err.message)) {
        console.log('detail: ', err.detail)
      }
    }
  })
})
