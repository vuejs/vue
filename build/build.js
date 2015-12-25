var fs = require('fs')
var zlib = require('zlib')
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

// update main file
var main = fs
  .readFileSync('src/index.js', 'utf-8')
  .replace(/Vue\.version = '[\d\.]+'/, "Vue.version = '" + version + "'")
fs.writeFileSync('src/index.js', main)

// Dev build
rollup.rollup({
  entry: 'src/index.js',
  plugins: [
    replace({
      'process.env.NODE_ENV': "'development'"
    }),
    babel({
      loose: 'all'
    })
  ]
})
.then(function (bundle) {
  return write('dist/vue.js', bundle.generate({
    format: 'umd',
    banner: banner,
    moduleName: 'Vue'
  }).code)
})
.then(function () {
  // Production build
  return rollup.rollup({
    entry: 'src/index.js',
    plugins: [
      replace({
        'process.env.NODE_ENV': "'production'"
      }),
      babel({
        loose: 'all'
      })
    ]
  })
  .then(function (bundle) {
    var code = bundle.generate({
      format: 'umd',
      moduleName: 'Vue'
    }).code
    var minified = banner + '\n' + uglify.minify(code, {
      fromString: true
    }).code
    return write('dist/vue.min.js', minified)
  })
  .then(zip)
})
.catch(logError)

function write (dest, code) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(dest, code, function (err) {
      if (err) return reject(err)
      console.log(blue(dest) + ' ' + getSize(code))
      resolve()
    })
  })
}

function zip () {
  return new Promise(function (resolve, reject) {
    fs.readFile('dist/vue.min.js', function (err, buf) {
      if (err) return reject(err)
      zlib.gzip(buf, function (err, buf) {
        if (err) return reject(err)
        write('dist/vue.min.js.gz', buf).then(resolve)
      })
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
