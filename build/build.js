const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const rollup = require('rollup')
const uglify = require('uglify-js')

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

// Update main file
const version = process.env.VERSION || require('../package.json').version
const main = fs
  .readFileSync('src/core/index.js', 'utf-8')
  .replace(/Vue\.version = '[^']+'/, "Vue.version = '" + version + "'")
fs.writeFileSync('src/core/index.js', main)

let builds = require('./config').getAllBuilds()

// filter builds via command line arg
if (process.argv[2]) {
  const filters = process.argv[2].split(',')
  builds = builds.filter(b => {
    return filters.some(f => b.dest.indexOf(f) > -1)
  })
}

build(builds)

function build (builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    buildEntry(builds[built]).then(() => {
      built++
      if (built < total) {
        next()
      }
    }).catch(logError)
  }

  next()
}

function buildEntry (config) {
  const isProd = /min\.js$/.test(config.dest)
  return rollup.rollup(config).then(bundle => {
    const code = bundle.generate(config).code
    if (isProd) {
      var minified = (config.banner ? config.banner + '\n' : '') + uglify.minify(code, {
        fromString: true,
        output: {
          screw_ie8: true,
          ascii_only: true
        },
        compress: {
          pure_funcs: ['makeMap']
        }
      }).code
      return write(config.dest, minified).then(zip(config.dest))
    } else {
      return write(config.dest, code)
    }
  })
}

function write (dest, code) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(dest, code, function (err) {
      if (err) return reject(err)
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code))
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
