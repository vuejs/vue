import Vue from 'core/index'
import config from 'core/config'
import { createPatchFunction } from 'core/vdom/patch'
import * as nodeOps from 'web/runtime/node-ops'
import platformDirectives from 'web/runtime/directives/index'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'
import { query, isUnknownElement, isReservedTag } from 'web/util/index'
import { noop } from 'core/util/index'

// install platform specific utils
Vue.config.isUnknownElement = isUnknownElement
Vue.config.isReservedTag = isReservedTag

// install platform runtime directives
Vue.options.directives = platformDirectives

// install platform patch function
const modules = baseModules.concat(platformModules)
Vue.prototype.__patch__ = config._isServer
  ? noop
  : createPatchFunction({ nodeOps, modules })

// wrap mount
Vue.prototype.$mount = function (el) {
  this.$el = el && query(el)
  this._mount()
}

export default Vue
