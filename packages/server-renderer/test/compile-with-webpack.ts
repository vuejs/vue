import path from 'path'
import webpack from 'webpack'
import MemoryFS from 'memory-fs'
import { RenderOptions } from 'server/create-renderer'
import { createBundleRenderer } from 'server/index'
import VueSSRServerPlugin from 'server/webpack-plugin/server'

export function compileWithWebpack(
  file: string,
  extraConfig?: webpack.Configuration
) {
  const config: webpack.Configuration = {
    mode: 'development',
    entry: path.resolve(__dirname, 'fixtures', file),
    module: {
      rules: [
        {
          test: /async-.*\.js$/,
          loader: require.resolve('./async-loader')
        },
        {
          test: /\.(png|woff2|css)$/,
          loader: require.resolve('file-loader'),
          options: {
            name: '[name].[ext]'
          }
        }
      ]
    }
  }
  if (extraConfig) {
    Object.assign(config, extraConfig)
  }

  const compiler = webpack(config)
  const fs = new MemoryFS()
  compiler.outputFileSystem = fs

  return new Promise<MemoryFS>((resolve, reject) => {
    compiler.run(err => {
      if (err) {
        reject(err)
      } else {
        resolve(fs)
      }
    })
  })
}

export async function createWebpackBundleRenderer(
  file: string,
  options?: RenderOptions & { asBundle?: boolean }
) {
  const asBundle = !!(options && options.asBundle)
  if (options) delete options.asBundle

  const fs = await compileWithWebpack(file, {
    target: 'node',
    devtool: asBundle ? 'source-map' : false,
    output: {
      path: '/',
      filename: 'bundle.js',
      libraryTarget: 'commonjs2'
    },
    externals: [require.resolve('../../../dist/vue.runtime.common.js')],
    plugins: asBundle ? [new VueSSRServerPlugin()] : []
  })

  const bundle = asBundle
    ? JSON.parse(fs.readFileSync('/vue-ssr-server-bundle.json', 'utf-8'))
    : fs.readFileSync('/bundle.js', 'utf-8')
  return createBundleRenderer(bundle, options)
}
