var webpack = require('webpack')
var glob = require('grunt/node_modules/glob')
var specs = glob.sync('test/unit/specs/**/*.js').map(function (f) {
  return './' + f
})

specs.unshift('./test/unit/lib/util.js')

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
    loose: 'all'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    })
  ],
  devtool: '#source-map'
}
