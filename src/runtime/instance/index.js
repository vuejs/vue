import { initState, stateMixin } from './state'
import { initRender, renderMixin } from './render'
import { initEvents, eventsMixin } from './events'
import { initLifecycle, lifecycleMixin } from './lifecycle'
import { nextTick } from '../util/index'

export default function Vue (options) {
  this.$options = options
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
