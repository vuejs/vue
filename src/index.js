import Vue from './instance/vue'
import directives from './directives/public/index'
import elementDirectives from './directives/element/index'
import filters from './filters/index'
import { inBrowser } from './util/index'

Vue.version = '1.0.13'

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
if (process.env.NODE_ENV !== 'production' && inBrowser) {
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('init', Vue)
  } else if (/Chrome\/\d+/.test(navigator.userAgent)) {
    console.log(
      'Download the Vue Devtools for a better development experience:\n' +
      'https://github.com/vuejs/vue-devtools'
    )
  }
}
