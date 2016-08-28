const path = require('path')
const flow = require('./rollup-plugin-flow')
const buble = require('rollup-plugin-buble')
const replace = require('rollup-plugin-replace')
const alias = require('rollup-plugin-alias')
const version = process.env.VERSION || require('../package.json').version

const banner =
  '/*!\n' +
  ' * Vue.js v' + version + '\n' +
  ' * (c) 2014-' + new Date().getFullYear() + ' Evan You\n' +
  ' * Released under the MIT License.\n' +
  ' */'

const baseAlias = require('./alias')

const builds = {
  // Runtime only (CommonJS). Used by bundlers e.g. Webpack & Browserify
  'web-runtime-dev': {
    entry: path.resolve(__dirname, '../src/entries/web-runtime.js'),
    dest: path.resolve(__dirname, '../dist/vue.common.js'),
    format: 'cjs'
  },
  // Minified runtime, only for filze size monitoring
  'web-runtime-prod': {
    entry: path.resolve(__dirname, '../src/entries/web-runtime.js'),
    dest: path.resolve(__dirname, '../dist/vue.common.min.js'),
    format: 'umd',
    env: 'production'
  },
  // Runtime+compiler standalone developement build.
  'web-standalone-dev': {
    entry: path.resolve(__dirname, '../src/entries/web-runtime-with-compiler.js'),
    dest: path.resolve(__dirname, '../dist/vue.js'),
    format: 'umd',
    env: 'development',
    banner,
    alias: {
      entities: './entity-decoder'
    }
  },
  // Runtime+compiler standalone production build.
  'web-standalone-prod': {
    entry: path.resolve(__dirname, '../src/entries/web-runtime-with-compiler.js'),
    dest: path.resolve(__dirname, '../dist/vue.min.js'),
    format: 'umd',
    env: 'production',
    banner,
    alias: {
      entities: './entity-decoder'
    }
  },
  // Web compiler (CommonJS).
  'web-compiler': {
    entry: path.resolve(__dirname, '../src/entries/web-compiler.js'),
    dest: path.resolve(__dirname, '../packages/vue-template-compiler/build.js'),
    format: 'cjs',
    external: ['entities', 'de-indent']
  },
  // Web server renderer (CommonJS).
  'web-server-renderer': {
    entry: path.resolve(__dirname, '../src/entries/web-server-renderer.js'),
    dest: path.resolve(__dirname, '../packages/vue-server-renderer/build.js'),
    format: 'cjs',
    external: ['stream', 'module', 'vm', 'entities', 'de-indent']
  }
}

function genConfig (opts) {
  const config = {
    entry: opts.entry,
    dest: opts.dest,
    external: opts.external,
    format: opts.format,
    banner: opts.banner,
    moduleName: 'Vue',
    plugins: [
      flow(),
      buble(),
      alias(Object.assign({}, baseAlias, opts.alias))
    ]
  }

  if (opts.env) {
    config.plugins.push(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env),
      'process.env.VUE_ENV': JSON.stringify('client')
    }))
  }

  return config
}

if (process.env.TARGET) {
  module.exports = genConfig(builds[process.env.TARGET])
} else {
  exports.getBuild = name => genConfig(builds[name])
  exports.getAllBuilds = () => Object.keys(builds).map(name => genConfig(builds[name]))
}
