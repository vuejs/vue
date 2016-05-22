/* @flow */

import Vue from 'core/index'
import config from 'core/config'
import { noop } from 'shared/util'
import { basePatch } from 'web/runtime/patch'
import platformDirectives from 'web/runtime/directives/index'
import { query, isUnknownElement, isReservedTag, mustUseProp } from 'web/util/index'

// install platform specific utils
Vue.config.isUnknownElement = isUnknownElement
Vue.config.isReservedTag = isReservedTag
Vue.config.mustUseProp = mustUseProp

// install platform runtime directives
Vue.options.directives = platformDirectives

// install platform patch function
Vue.prototype.__patch__ = config._isServer ? noop : basePatch

// wrap mount
Vue.prototype.$mount = function (el?: string | Element): Vue {
  this.$el = el && query(el)
  return this._mount()
}

export default Vue
