import { initState, stateMixin } from './state'
import { initRender, renderMixin } from './render'
import { initEvents, eventsMixin } from './events'
import { initLifecycle, lifecycleMixin, callHook } from './lifecycle'
import { nextTick, mergeOptions } from '../util/index'

let uid = 0

export default function Vue (options) {
  this._init(options)
}

Vue.prototype._init = function (options) {
  // a uid
  this._uid = uid++
  // a flag to avoid this being observed
  this._isVue = true
  // merge options
  this.$options = mergeOptions(
    this.constructor.options,
    options || {},
    this
  )
  initLifecycle(this)
  initEvents(this)
  callHook(this, 'init')
  initState(this)
  callHook(this, 'created')
  initRender(this)
}

Vue.prototype.$nextTick = function (fn) {
  nextTick(fn, this)
}

stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
