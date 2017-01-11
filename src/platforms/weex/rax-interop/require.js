const raxFactory = require('rax/dist/rax.factory')

export default function genRaxRequire (document) {
  const context = {
    document,
    __weex_document__: document
  }

  const modules = {
    rax: {
      factory: raxFactory.bind(context),
      module: { exports: {}},
      isInitialized: false
    }
  }

  return function require (name) {
    var mod = modules[name]

    if (mod && mod.isInitialized) {
      return mod.module.exports
    }

    if (!mod) {
      throw new Error(
        'Requiring unknown module "' + name + '"'
      )
    }

    if (mod.hasError) {
      throw new Error(
        'Requiring module "' + name + '" which threw an exception'
      )
    }

    try {
      mod.isInitialized = true
      mod.factory(require, mod.module.exports, mod.module)
    } catch (e) {
      mod.hasError = true
      mod.isInitialized = false
      throw e
    }

    return mod.module.exports
  }
}
