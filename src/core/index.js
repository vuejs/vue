import Vue from './instance/index'
import config from './config'
import { initGlobalAPI } from './global-api/index'

initGlobalAPI(Vue)

// defining $isServer flag here because flow cannot handle
// Object.defineProperty getters
Object.defineProperty(Vue.prototype, '$isServer', {
  get: () => config._isServer
})

Vue.version = '2.0.0-alpha.0'

export default Vue
