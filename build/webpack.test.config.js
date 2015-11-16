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
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel', exclude: /test\/unit/ }
    ]
  },
  babel: {
    presets: ['es2015']
  },
  devtool: '#source-map'
}
