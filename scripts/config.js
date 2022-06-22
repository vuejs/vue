const path = require('path')
const alias = require('@rollup/plugin-alias')
const cjs = require('@rollup/plugin-commonjs')
const replace = require('@rollup/plugin-replace')
const node = require('@rollup/plugin-node-resolve').nodeResolve
const ts = require('rollup-plugin-typescript2')

const version = process.env.VERSION || require('../package.json').version
const featureFlags = require('./feature-flags')

const banner =
  '/*!\n' +
  ` * Vue.js v${version}\n` +
  ` * (c) 2014-${new Date().getFullYear()} Evan You\n` +
  ' * Released under the MIT License.\n' +
  ' */'

const aliases = require('./alias')
const resolve = p => {
  const base = p.split('/')[0]
  if (aliases[base]) {
    return path.resolve(aliases[base], p.slice(base.length + 1))
  } else {
    return path.resolve(__dirname, '../', p)
  }
}

// we are bundling forked consolidate.js in compiler-sfc which dynamically
// requires a ton of template engines which should be ignored.
const consolidatePath = require.resolve('@vue/consolidate/package.json', {
  paths: [path.resolve(__dirname, '../packages/compiler-sfc')]
})

const builds = {
  // Runtime only (CommonJS). Used by bundlers e.g. Webpack & Browserify
  'runtime-cjs-dev': {
    entry: resolve('web/entry-runtime.ts'),
    dest: resolve('dist/vue.runtime.common.dev.js'),
    format: 'cjs',
    env: 'development',
    banner
  },
  'runtime-cjs-prod': {
    entry: resolve('web/entry-runtime.ts'),
    dest: resolve('dist/vue.runtime.common.prod.js'),
    format: 'cjs',
    env: 'production',
    banner
  },
  // Runtime+compiler CommonJS build (CommonJS)
  'full-cjs-dev': {
    entry: resolve('web/entry-runtime-with-compiler.ts'),
    dest: resolve('dist/vue.common.dev.js'),
    format: 'cjs',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
  'full-cjs-prod': {
    entry: resolve('web/entry-runtime-with-compiler.ts'),
    dest: resolve('dist/vue.common.prod.js'),
    format: 'cjs',
    env: 'production',
    alias: { he: './entity-decoder' },
    banner
  },
  // Runtime only ES modules build (for bundlers)
  'runtime-esm': {
    entry: resolve('web/entry-runtime-esm.ts'),
    dest: resolve('dist/vue.runtime.esm.js'),
    format: 'es',
    banner
  },
  // Runtime only ES modules build (for Node)
  'runtime-mjs': {
    entry: resolve('web/entry-runtime-esm.ts'),
    dest: resolve('dist/vue.runtime.mjs'),
    format: 'es',
    banner
  },
  // Runtime+compiler ES modules build (for bundlers)
  'full-esm': {
    entry: resolve('web/entry-runtime-with-compiler-esm.ts'),
    dest: resolve('dist/vue.esm.js'),
    format: 'es',
    alias: { he: './entity-decoder' },
    banner
  },
  // Runtime+compiler ES modules build (for direct import in browser)
  'full-esm-browser-dev': {
    entry: resolve('web/entry-runtime-with-compiler-esm.ts'),
    dest: resolve('dist/vue.esm.browser.js'),
    format: 'es',
    transpile: false,
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
  // Runtime+compiler ES modules build (for direct import in browser)
  'full-esm-browser-prod': {
    entry: resolve('web/entry-runtime-with-compiler-esm.ts'),
    dest: resolve('dist/vue.esm.browser.min.js'),
    format: 'es',
    transpile: false,
    env: 'production',
    alias: { he: './entity-decoder' },
    banner
  },
  // runtime-only build (Browser)
  'runtime-dev': {
    entry: resolve('web/entry-runtime.ts'),
    dest: resolve('dist/vue.runtime.js'),
    format: 'umd',
    env: 'development',
    banner
  },
  // runtime-only production build (Browser)
  'runtime-prod': {
    entry: resolve('web/entry-runtime.ts'),
    dest: resolve('dist/vue.runtime.min.js'),
    format: 'umd',
    env: 'production',
    banner
  },
  // Runtime+compiler development build (Browser)
  'full-dev': {
    entry: resolve('web/entry-runtime-with-compiler.ts'),
    dest: resolve('dist/vue.js'),
    format: 'umd',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
  // Runtime+compiler production build  (Browser)
  'full-prod': {
    entry: resolve('web/entry-runtime-with-compiler.ts'),
    dest: resolve('dist/vue.min.js'),
    format: 'umd',
    env: 'production',
    alias: { he: './entity-decoder' },
    banner
  },
  // Web compiler (CommonJS).
  compiler: {
    entry: resolve('web/entry-compiler.ts'),
    dest: resolve('packages/template-compiler/build.js'),
    format: 'cjs',
    external: Object.keys(
      require('../packages/template-compiler/package.json').dependencies
    )
  },
  // Web compiler (UMD for in-browser use).
  'compiler-browser': {
    entry: resolve('web/entry-compiler.ts'),
    dest: resolve('packages/template-compiler/browser.js'),
    format: 'umd',
    env: 'development',
    moduleName: 'VueTemplateCompiler',
    plugins: [node(), cjs()]
  },
  // Web server renderer (CommonJS).
  'server-renderer-dev': {
    entry: resolve('packages/server-renderer/src/index.ts'),
    dest: resolve('packages/server-renderer/build.dev.js'),
    format: 'cjs',
    env: 'development',
    external: [
      'stream',
      ...Object.keys(
        require('../packages/server-renderer/package.json').dependencies
      )
    ]
  },
  'server-renderer-prod': {
    entry: resolve('server/index.ts'),
    dest: resolve('packages/server-renderer/build.prod.js'),
    format: 'cjs',
    env: 'production',
    external: [
      'stream',
      ...Object.keys(
        require('../packages/server-renderer/package.json').dependencies
      )
    ]
  },
  'server-renderer-basic': {
    entry: resolve('server/index-basic.ts'),
    dest: resolve('packages/server-renderer/basic.js'),
    format: 'umd',
    env: 'development',
    moduleName: 'renderVueComponentToString',
    plugins: [node(), cjs()]
  },
  'server-renderer-webpack-server-plugin': {
    entry: resolve('server/webpack-plugin/server.ts'),
    dest: resolve('packages/server-renderer/server-plugin.js'),
    format: 'cjs',
    external: Object.keys(
      require('../packages/server-renderer/package.json').dependencies
    )
  },
  'server-renderer-webpack-client-plugin': {
    entry: resolve('server/webpack-plugin/client.ts'),
    dest: resolve('packages/server-renderer/client-plugin.js'),
    format: 'cjs',
    external: Object.keys(
      require('../packages/server-renderer/package.json').dependencies
    )
  },
  'compiler-sfc': {
    entry: resolve('packages/compiler-sfc/src/index.ts'),
    dest: resolve('packages/compiler-sfc/dist/compiler-sfc.js'),
    format: 'cjs',
    external: Object.keys(
      require('../packages/compiler-sfc/package.json').dependencies
    ),
    plugins: [
      node({ preferBuiltins: true }),
      cjs({
        ignore: [
          ...Object.keys(require(consolidatePath).devDependencies),
          'vm',
          'crypto',
          'react-dom/server',
          'teacup/lib/express',
          'arc-templates/dist/es5',
          'then-pug',
          'then-jade'
        ]
      })
    ]
  }
}

function genConfig(name) {
  const opts = builds[name]

  // console.log('__dir', __dirname)
  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: [
      alias({
        entries: Object.assign({}, aliases, opts.alias)
      }),
      ts({
        tsconfig: path.resolve(__dirname, '../', 'tsconfig.json'),
        cacheRoot: path.resolve(__dirname, '../', 'node_modules/.rts2_cache'),
        tsconfigOverride: {
          compilerOptions: {
            // if targeting browser, target es5
            // if targeting node, es2017 means Node 8
            target:
              opts.transpile === false || opts.format === 'cjs'
                ? 'es2017'
                : 'es5'
          },
          exclude: ['test', 'test-dts']
        }
      })
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || 'Vue',
      exports: 'auto'
    },
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    }
  }

  // console.log('pluging', config.plugins)

  // built-in vars
  const vars = {
    __VERSION__: version,
    __DEV__: `process.env.NODE_ENV !== 'production'`,
    __TEST__: false,
    __GLOBAL__: opts.format === 'umd' || name.includes('browser')
  }
  // feature flags
  Object.keys(featureFlags).forEach(key => {
    vars[`process.env.${key}`] = featureFlags[key]
  })
  // build-specific env
  if (opts.env) {
    vars['process.env.NODE_ENV'] = JSON.stringify(opts.env)
    vars.__DEV__ = opts.env !== 'production'
  }

  vars.preventAssignment = true
  config.plugins.push(replace(vars))

  Object.defineProperty(config, '_name', {
    enumerable: false,
    value: name
  })

  return config
}

if (process.env.TARGET) {
  module.exports = genConfig(process.env.TARGET)
} else {
  exports.getBuild = genConfig
  exports.getAllBuilds = () => Object.keys(builds).map(genConfig)
}
