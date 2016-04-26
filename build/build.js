var fs = require('fs')
var path = require('path')
var zlib = require('zlib')
var rollup = require('rollup')
var uglify = require('uglify-js')
var babel = require('rollup-plugin-babel')
var replace = require('rollup-plugin-replace')
var aliasPlugin = require('rollup-plugin-alias')
var baseAlias = require('./alias')
var version = process.env.VERSION || require('../package.json').version

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

var banner =
  '/*!\n' +
  ' * Vue.js v' + version + '\n' +
  ' * (c) 2014-' + new Date().getFullYear() + ' Evan You\n' +
  ' * Released under the MIT License.\n' +
  ' */'

// Update main file
var main = fs
  .readFileSync('src/core/index.js', 'utf-8')
  .replace(/Vue\.version = '[\d\.]+'/, "Vue.version = '" + version + "'")
fs.writeFileSync('src/core/index.js', main)

var builds = [
  // Runtime only, CommonJS build. Used by bundlers e.g. Webpack & Browserify
  {
    entry: 'src/entries/web-runtime.js',
    format: 'cjs',
    out: 'dist/vue.common.js'
  },
  // Minified runtime, only for filze size monitoring
  {
    entry: 'src/entries/web-runtime.js',
    format: 'umd',
    env: 'production',
    out: 'dist/vue.common.min.js'
  },
  // Runtime+compiler standalone developement build.
  {
    entry: 'src/entries/web-runtime-with-compiler.js',
    format: 'umd',
    env: 'development',
    out: 'dist/vue.js',
    banner: true,
    alias: {
      entities: './entity-decoder'
    }
  },
  // Runtime+compiler standalone production build.
  {
    entry: 'src/entries/web-runtime-with-compiler.js',
    format: 'umd',
    env: 'production',
    out: 'dist/vue.min.js',
    banner: true,
    alias: {
      entities: './entity-decoder'
    }
  },
  // Web compiler CommonJS build, for npm distribution.
  {
    entry: 'src/entries/web-compiler.js',
    format: 'cjs',
    external: ['entities'],
    out: 'dist/compiler.common.js'
  },
  // Web server renderer
  {
    entry: 'src/entries/web-server-renderer.js',
    format: 'cjs',
    external: ['stream'],
    out: 'dist/server-renderer.js'
  }
]

// filter builds via command line arg
if (process.argv[2]) {
  var filters = process.argv[2].split(',')
  builds = builds.filter(b => {
    return filters.some(f => b.out.indexOf(f) > -1)
  })
}

build(builds)

function build (builds) {
  var built = 0
  var total = builds.length
  next()
  function next () {
    buildEntry(builds[built]).then(function () {
      built++
      if (built < total) {
        next()
      }
    }).catch(logError)
  }
}

function buildEntry (opts) {
  var plugins = [babel()]
  if (opts.env) {
    plugins.push(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }
  var alias = baseAlias
  if (opts.alias) {
    alias = Object.assign({}, baseAlias, opts.alias)
  }
  plugins.push(aliasPlugin(alias))
  return rollup.rollup({
    entry: opts.entry,
    plugins: plugins,
    external: opts.external
  }).then(function (bundle) {
    var code = bundle.generate({
      format: opts.format,
      moduleName: 'Vue',
      banner: opts.banner ? banner : null
    }).code
    if (opts.env === 'production') {
      var minified = (opts.banner ? banner + '\n' : '') + uglify.minify(code, {
        fromString: true,
        output: {
          ascii_only: true
        },
        compress: {
          pure_funcs: ['makeMap']
        }
      }).code
      return write(opts.out, minified).then(zip(opts.out))
    } else {
      return write(opts.out, code)
    }
  })
}

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
