import Vue from 'vue'

describe('Global API: use', () => {
  const def = {}
  const options = {}
  const pluginStub = {
    install: (Vue, opts) => {
      Vue.directive('plugin-test', def)
      expect(opts).toBe(options)
    }
  }

  it('should apply Object plugin', () => {
    Vue.use(pluginStub, options)
    expect(Vue.options.directives['plugin-test']).toBe(def)
    delete Vue.options.directives['plugin-test']
  })

  it('should apply Function plugin', () => {
    Vue.use(pluginStub.install, options)
    expect(Vue.options.directives['plugin-test']).toBe(def)
    delete Vue.options.directives['plugin-test']
  })
})
