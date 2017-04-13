/* globals __VUE_SSR_CONTEXT__ */

module.exports = {
  beforeCreate () {
    __VUE_SSR_CONTEXT__._registeredComponents.add('__MODULE_ID__')
  },
  render (h) {
    return h('div', 'async bar')
  }
}
