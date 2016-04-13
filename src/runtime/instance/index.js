import { initState, stateMixin } from './state'
import { initRender, renderMixin } from './render'
import { initEvents, eventsMixin } from './events'
import { initLifecycle, lifecycleMixin } from './lifecycle'
import { nextTick, mergeOptions } from '../util/index'

let uid = 0

export default function Vue (options) {
  options = options || {}

  this.$parent = options.parent
  this.$root = this.$parent
    ? this.$parent.$root
    : this
  this.$children = []
  this.$refs = {}       // child vm references
  this.$els = {}        // element references

  // a uid
  this._uid = uid++
  // a flag to avoid this being observed
  this._isVue = true

  options = this.$options = mergeOptions(
    this.constructor.options,
    options,
    this
  )

  initState(this)
  initEvents(this)
  initLifecycle(this)
  initRender(this)
}

stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

Vue.prototype.$nextTick = function (fn) {
  nextTick(fn, this)
}
