var fs = require('fs')
var rollup = require('rollup')
var uglify = require('uglify-js')
var babel = require('rollup-plugin-babel')
var replace = require('rollup-plugin-replace')
var version = process.env.VERSION || require('../package.json').version
var banner =
  '/*!\n' +
  ' * Vue.js v' + version + '\n' +
  ' * (c) ' + new Date().getFullYear() + ' Evan You\n' +
  ' * Released under the MIT License.\n' +
  ' */'

rollup.rollup({
  entry: 'src/index.js',
  plugins: [
    replace({
      'process.env.NODE_ENV': "'production'"
    }),
    babel({
      loose: 'all',
      sourceMap: true
    })
  ]
}).then(function (bundle) {
  bundle.write({
    format: 'cjs',
    dest: 'dist/vue.common.js'
  }).then(function () {
    console.log('built: dist/vue.common.js')
  })
  return bundle.write({
    format: 'umd',
    banner: banner,
    moduleName: 'Vue',
    sourceMap: true,
    dest: 'dist/vue.js'
  })
}).then(function () {
  console.log('built: ' + 'dist/vue.js')
  fs.writeFile(
    'dist/vue.min.js',
    banner + '\n' + uglify.minify('dist/vue.js').code,
    function (err) {
      if (err) throw err
      console.log('built: ' + 'dist/vue.min.js')
    }
  )
}).catch(function (e) {
  console.log(e)
})
