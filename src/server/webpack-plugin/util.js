const { red, yellow, gray } = require('chalk')

const prefix = `[vue-server-renderer-webpack-plugin]`
const warn = exports.warn = msg => console.error(red(`${prefix} ${msg}\n`))
const tip = exports.tip = msg => console.log(yellow(`${prefix} ${msg}\n`))

export const validate = compiler => {
  if (compiler.options.target !== 'node') {
    warn('webpack config `target` should be "node".')
  }

  if (compiler.options.output && compiler.options.output.libraryTarget !== 'commonjs2') {
    warn('webpack config `output.libraryTarget` should be "commonjs2".')
  }

  if (!compiler.options.externals) {
    tip(
      'It is recommended to externalize dependencies for better ssr performance.\n' +
      `See ${gray('https://github.com/vuejs/vue/tree/dev/packages/vue-server-renderer#externals')} ` +
      'for more details.'
    )
  }
}

export const isJS = file => /\.js($|\?)/.test(file)
