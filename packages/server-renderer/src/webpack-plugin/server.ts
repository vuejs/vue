import { validate, isJS, getAssetName, onEmit } from './util'

export default class VueSSRServerPlugin {
  constructor(options = {}) {
    //@ts-expect-error
    this.options = Object.assign(
      {
        filename: 'vue-ssr-server-bundle.json'
      },
      options
    )
  }

  apply(compiler) {
    validate(compiler)

    const stage = 'PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER'
    onEmit(compiler, 'vue-server-plugin', stage, (compilation, cb) => {
      const stats = compilation.getStats().toJson()
      const entryName = Object.keys(stats.entrypoints)[0]
      const entryInfo = stats.entrypoints[entryName]

      if (!entryInfo) {
        // #5553
        return cb()
      }

      const entryAssets = entryInfo.assets.map(getAssetName).filter(isJS)

      if (entryAssets.length > 1) {
        throw new Error(
          `Server-side bundle should have one single entry file. ` +
            `Avoid using CommonsChunkPlugin in the server config.`
        )
      }

      const entry = entryAssets[0]
      if (!entry || typeof entry !== 'string') {
        throw new Error(
          `Entry "${entryName}" not found. Did you specify the correct entry option?`
        )
      }

      const bundle = {
        entry,
        files: {},
        maps: {}
      }

      Object.keys(compilation.assets).forEach(name => {
        if (isJS(name)) {
          bundle.files[name] = compilation.assets[name].source()
        } else if (name.match(/\.js\.map$/)) {
          bundle.maps[name.replace(/\.map$/, '')] = JSON.parse(
            compilation.assets[name].source()
          )
        }
        // do not emit anything else for server
        delete compilation.assets[name]
      })

      const json = JSON.stringify(bundle, null, 2)
      //@ts-expect-error
      const filename = this.options.filename

      compilation.assets[filename] = {
        source: () => json,
        size: () => json.length
      }

      cb()
    })
  }
}
