var glob = require('grunt/node_modules/glob')
var specs = glob.sync('test/unit/specs/**/*.js').map(function (f) {
  return './' + f
})

module.exports = {
  entry: specs,
  output: {
    path: './test/unit',
    filename: 'specs.js'
  },
  devtool: '#source-map'
}
