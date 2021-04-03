import Vue, { VueConstructor } from 'vue'

// based on https://github.com/vuejs/vue-test-utils/blob/dev/packages/test-utils/src/create-local-vue.js

export function createLocalVue(_Vue: VueConstructor = Vue) {
  const instance = _Vue.extend()

  Object.keys(_Vue).forEach((key) => {
    // @ts-ignore
    instance[key] = _Vue[key]
  })

  // @ts-ignore
  if (instance._installedPlugins && instance._installedPlugins.length) {
    // @ts-ignore
    instance._installedPlugins.length = 0
  }

  instance.config = _Vue.config

  const use = instance.use
  //@ts-ignore
  instance.use = (plugin, ...rest) => {
    if (plugin.installed === true) {
      plugin.installed = false
    }
    if (plugin.install && plugin.install.installed === true) {
      plugin.install.installed = false
    }
    use.call(instance, plugin, ...rest)
  }
  return instance
}
