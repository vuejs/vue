import { initProxy } from './proxy'
import { initState, stateMixin } from './state'
import { initRender, renderMixin } from './render'
import { initEvents, eventsMixin } from './events'
import { initLifecycle, lifecycleMixin, callHook } from './lifecycle'
import { mergeOptions } from '../util/index'

let uid = 0

export default class Vue {
  constructor (options) {
    this._init(options)
  }

  _init (options) {
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
    if (process.env.NODE_ENV !== 'production') {
      initProxy(this)
    } else {
      this._renderProxy = this
    }
    initLifecycle(this)
    initEvents(this)
    callHook(this, 'init')
    initState(this)
    callHook(this, 'created')
    initRender(this)
  }
}

stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
