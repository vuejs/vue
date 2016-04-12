import Watcher from '../observer/watcher'
import { h, patch } from '../vdom/index'
import { nextTick, query } from '../util/index'
import stateMixin from './internal/state'

export default function Vue (options) {
  this.$options = options
  this._watchers = []
  this._initState()
  this._el = query(options.el)
  this._el.innerHTML = ''
  this._watcher = new Watcher(this, options.render, this._update)
  this._update(this._watcher.value)
}

Vue.prototype._update = function (vtree) {
  if (!this._tree) {
    patch(this._el, vtree)
  } else {
    patch(this._tree, vtree)
  }
  this._tree = vtree
}

Vue.prototype.__h__ = h
Vue.nextTick = nextTick

stateMixin(Vue)
