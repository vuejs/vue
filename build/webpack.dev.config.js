module.exports = {
  entry: './src/vue',
  output: {
    path: './dist',
    filename: 'vue.js',
    library: 'Vue',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel' }
    ]
  },
  babel: {
    presets: ['es2015']
  },
  devtool: '#source-map'
}
