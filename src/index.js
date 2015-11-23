import Vue from './instance/vue'
import directives from './directives/public/index'
import elementDirectives from './directives/element/index'
import filters from './filters/index'
import { inBrowser } from './util/index'

Vue.version = '1.0.10'

/**
 * Vue and every constructor that extends Vue has an
 * associated options object, which can be accessed during
 * compilation steps as `this.constructor.options`.
 *
 * These can be seen as the default options of every
 * Vue instance.
 */

Vue.options = {
  directives,
  elementDirectives,
  filters,
  transitions: {},
  components: {},
  partials: {},
  replace: true
}

export default Vue

// devtools global hook
/* istanbul ignore if */
if (process.env.NODE_ENV !== 'production') {
  if (inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('init', Vue)
  }
}
