import { validate, isJS, onEmit } from './util'

export default class VueSSRServerPlugin {
  constructor (options = {}) {
    this.options = Object.assign({
      filename: 'vue-ssr-server-bundle.json'
    }, options)
  }

  apply (compiler) {
    validate(compiler)

    onEmit(compiler, 'vue-server-plugin', (compilation, cb) => {
      const stats = compilation.getStats().toJson()
      const entryName = Object.keys(stats.entrypoints)[0]
      const entryInfo = stats.entrypoints[entryName]

      if (!entryInfo) {
        // #5553
        return cb()
      }

      const entryAssets = entryInfo.assets
        .map(function (file) {
          if (typeof file === "string") {
            return file;
          }

          if (
            Object.prototype.toString.call(file) === "[object Object]" &&
            file.name
          ) {
            return file.name;
          }

          throw new Error(`file structure is not correct: ${file}`);
        }).filter(isJS)

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

      stats.assets.forEach(asset => {
        if (isJS(asset.name)) {
          bundle.files[asset.name] = compilation.assets[asset.name].source()
          if (asset.info && asset.info.related && asset.info.related.sourceMap) {
            bundle.maps[asset.info.related.sourceMap.replace(/\.map$/, '')] = JSON.parse(compilation.assets[asset.info.related.sourceMap].source());
          }
        } else if (asset.name.match(/\.js\.map$/)) {
          bundle.maps[asset.name.replace(/\.map$/, '')] = JSON.parse(compilation.assets[asset.name].source())
        }
        // do not emit anything else for server
        delete compilation.assets[asset.name]
      })

      const json = JSON.stringify(bundle, null, 2)
      const filename = this.options.filename

      compilation.assets[filename] = {
        source: () => json,
        size: () => json.length
      }

      cb()
    })
  }
}
