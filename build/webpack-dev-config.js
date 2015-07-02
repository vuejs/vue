module.exports = {
  entry: './src/vue',
  output: {
    path: './dist',
    filename: 'vue.js',
    library: 'Vue',
    libraryTarget: 'umd'
  },
  devtool: '#source-map'
}
