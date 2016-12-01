import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'
import { isServerRendering } from 'core/util/env'
import { warn } from 'core/util/index'
import { modifierCode } from '../compiler/codegen/events'

initGlobalAPI(Vue)

for (const key in modifierCode) {
  Vue.config.keyCodes[key] = undefined
}

const configWatcherVM = new Vue({
  data: {
    config: Vue.config
  },
  watch: {
    'config.keyCodes': {
      handler: (val, oldVal) => {
        if (process.env.NODE_ENV !== 'production') {
          for (const key in modifierCode) {
            if (Vue.config.keyCodes[key]) {
              Vue.config.keyCodes[key] = undefined
              warn(
                `Invalid custom key modifier alias "${key}". Built-in modifier aliases are not allowed.`
              )
            }
          }
        }
      },
      deep: true
    }
  }
})

Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

Vue.version = '2.1.3'

export default Vue
