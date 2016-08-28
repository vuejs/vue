const flowRemoveTypes = require('flow-remove-types')
const createFilter = require('rollup-pluginutils').createFilter

module.exports = options => {
  options = options || {}
  const filter = createFilter(options.include, options.exclude)

  return {
    name: 'flow-remove-types',
    transform: (code, id) => {
      if (filter(id)) {
        return flowRemoveTypes(code)
      }
    }
  }
}
