import { initState, stateMixin } from './state'
import { initRender, renderMixin } from './render'
import { initEvents, eventsMixin } from './events'

export default function Vue (options) {
  this.$options = options
  this._watchers = []
  initState(this)
  initEvents(this)
  initRender(this)
}

stateMixin(Vue)
eventsMixin(Vue)
renderMixin(Vue)
