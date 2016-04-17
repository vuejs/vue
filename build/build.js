var fs = require('fs')
var zlib = require('zlib')
var rollup = require('rollup')
var uglify = require('uglify-js')
var babel = require('rollup-plugin-babel')
var replace = require('rollup-plugin-replace')
var alias = require('rollup-plugin-alias')
var version = process.env.VERSION || require('../package.json').version

var banner =
  '/*!\n' +
  ' * Vue.js v' + version + '\n' +
  ' * (c) ' + new Date().getFullYear() + ' Evan You\n' +
  ' * Released under the MIT License.\n' +
  ' */'

// update main file
var main = fs
  .readFileSync('src/runtime/index.js', 'utf-8')
  .replace(/Vue\.version = '[\d\.]+'/, "Vue.version = '" + version + "'")
fs.writeFileSync('src/runtime/index.js', main)

// CommonJS build.
// this is used as the "main" field in package.json
// and used by bundlers like Webpack and Browserify.
// runtime only, because it's meant to be
// used with vue-loader which pre-compiles the template.
rollup.rollup({
  entry: 'src/runtime/index.js',
  plugins: [babel()]
})
.then(function (bundle) {
  var code = bundle.generate({
    format: 'cjs',
    banner: banner
  }).code
  return write('dist/vue.common.js', code)
})
// production CommonJS build, just for file size monitoring.
.then(function () {
  return rollup.rollup({
    entry: 'src/runtime/index.js',
    plugins: [
      replace({
        'process.env.NODE_ENV': "'production'"
      }),
      babel()
    ]
  })
}).then(function (bundle) {
  var code = bundle.generate({
    format: 'cjs'
  }).code
  return write('dist/vue.common.min.js', uglify.minify(code, {
    fromString: true,
    output: {
      ascii_only: true
    }
  }).code)
})
.then(zip('dist/vue.common.min.js'))
// Compiler CommonJS build.
// Used in Node loaders/transforms.
.then(function () {
  return rollup.rollup({
    entry: 'src/compiler/index.js',
    plugins: [babel()]
  })
  .then(function (bundle) {
    write('dist/compiler/compiler.js', bundle.generate({
      format: 'cjs'
    }).code)
  })
})
// Standalone Dev Build
.then(function () {
  return rollup.rollup({
    entry: 'src/runtime-with-compiler.js',
    plugins: [
      alias({
        entities: './entity-decoder'
      }),
      replace({
        'process.env.NODE_ENV': "'development'"
      }),
      babel()
    ]
  })
  .then(function (bundle) {
    return write('dist/vue.js', bundle.generate({
      format: 'umd',
      banner: banner,
      moduleName: 'Vue'
    }).code)
  })
})
.then(function () {
  // Standalone Production Build
  return rollup.rollup({
    entry: 'src/runtime-with-compiler.js',
    plugins: [
      alias({
        entities: './entity-decoder'
      }),
      replace({
        'process.env.NODE_ENV': "'production'"
      }),
      babel()
    ]
  })
  .then(function (bundle) {
    var code = bundle.generate({
      format: 'umd',
      moduleName: 'Vue'
    }).code
    var minified = banner + '\n' + uglify.minify(code, {
      fromString: true,
      output: {
        ascii_only: true
      }
    }).code
    return write('dist/vue.min.js', minified)
  })
  .then(zip('dist/vue.min.js'))
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

function zip (file) {
  return function () {
    return new Promise(function (resolve, reject) {
      fs.readFile(file, function (err, buf) {
        if (err) return reject(err)
        zlib.gzip(buf, function (err, buf) {
          if (err) return reject(err)
          write(file + '.gz', buf).then(resolve)
        })
      })
    })
  }
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
