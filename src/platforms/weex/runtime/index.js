/* @flow */

import Vue from 'core/index'
import { patch } from 'weex/runtime/patch'
import platformDirectives from 'weex/runtime/directives/index'
import platformComponents from 'weex/runtime/components/index'
import { query, isUnknownElement, isReservedTag, mustUseProp } from 'weex/util/index'

// install platform specific utils
Vue.config.isUnknownElement = isUnknownElement
Vue.config.isReservedTag = isReservedTag
Vue.config.mustUseProp = mustUseProp

// install platform runtime directives and components
Vue.options.directives = platformDirectives
Vue.options.components = platformComponents

// install platform patch function
Vue.prototype.__patch__ = patch

// wrap mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  return this._mount(el && query(el, this.$document), hydrating)
}

export default Vue
