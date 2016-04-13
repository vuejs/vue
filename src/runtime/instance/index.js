import Watcher from '../observer/watcher'
import { h, patch } from '../vdom/index'
import { nextTick, query } from '../util/index'
import { initState, setData } from './state'

export default function Vue (options) {
  this.$options = options
  this._watchers = []
  initState(this)
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

Vue.prototype.$forceUpdate = function () {
  this._watcher.run()
}

Object.defineProperty(Vue.prototype, '$data', {
  get () {
    return this._data
  },
  set (newData) {
    if (newData !== this._data) {
      setData(this, newData)
    }
  }
})

Vue.prototype.__h__ = h
Vue.nextTick = nextTick
