import Vue from './instance/vue'
import _, { inBrowser } from './util'

// devtools global hook
/* istanbul ignore if */
if (process.env.NODE_ENV !== 'production') {
  if (inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('init', Vue)
  }
}

_.Vue = Vue
Vue.version = '1.0.8'
export default Vue
