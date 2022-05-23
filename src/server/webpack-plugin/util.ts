const { red, yellow } = require('chalk')
const webpack = require('webpack')

const prefix = `[vue-server-renderer-webpack-plugin]`
const warn = (exports.warn = msg => console.error(red(`${prefix} ${msg}\n`)))
const tip = (exports.tip = msg => console.log(yellow(`${prefix} ${msg}\n`)))

const isWebpack5 = !!(webpack.version && webpack.version[0] > 4)

export const validate = compiler => {
  if (compiler.options.target !== 'node') {
    warn('webpack config `target` should be "node".')
  }

  if (compiler.options.output) {
    if (compiler.options.output.library) {
      // Webpack >= 5.0.0
      if (compiler.options.output.library.type !== 'commonjs2') {
        warn('webpack config `output.library.type` should be "commonjs2".')
      }
    } else if (compiler.options.output.libraryTarget !== 'commonjs2') {
      // Webpack < 5.0.0
      warn('webpack config `output.libraryTarget` should be "commonjs2".')
    }
  }

  if (!compiler.options.externals) {
    tip(
      'It is recommended to externalize dependencies in the server build for ' +
        'better build performance.'
    )
  }
}

export const onEmit = (compiler, name, stageName, hook) => {
  if (isWebpack5) {
    // Webpack >= 5.0.0
    compiler.hooks.compilation.tap(name, compilation => {
      if (compilation.compiler !== compiler) {
        // Ignore child compilers
        return
      }
      const stage = webpack.Compilation[stageName]
      compilation.hooks.processAssets.tapAsync(
        { name, stage },
        (assets, cb) => {
          hook(compilation, cb)
        }
      )
    })
  } else if (compiler.hooks) {
    // Webpack >= 4.0.0
    compiler.hooks.emit.tapAsync(name, hook)
  } else {
    // Webpack < 4.0.0
    compiler.plugin('emit', hook)
  }
}

export const stripModuleIdHash = id => {
  if (isWebpack5) {
    // Webpack >= 5.0.0
    return id.replace(/\|\w+$/, '')
  }
  // Webpack < 5.0.0
  return id.replace(/\s\w+$/, '')
}

export const getAssetName = asset => {
  if (typeof asset === 'string') {
    return asset
  }
  return asset.name
}

export { isJS, isCSS } from '../util'
