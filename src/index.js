import Vue from './instance/vue'
import installGlobalAPI from './global-api'
import { inBrowser, devtools } from './util/index'

installGlobalAPI(Vue)

Vue.version = '1.0.17'

export default Vue

// devtools global hook
/* istanbul ignore next */
if (devtools) {
  devtools.emit('init', Vue)
} else if (
  process.env.NODE_ENV !== 'production' &&
  inBrowser && /Chrome\/\d+/.test(window.navigator.userAgent)
) {
  console.log(
    'Download the Vue Devtools for a better development experience:\n' +
    'https://github.com/vuejs/vue-devtools'
  )
}
