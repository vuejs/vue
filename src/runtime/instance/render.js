import Watcher from '../observer/watcher'
import { query } from '../util/index'
import { h, patch } from '../vdom/index'

export function initRender (vm) {
  const options = vm.$options
  vm._el = query(options.el)
  vm._el.innerHTML = ''
  vm._watcher = new Watcher(vm, options.render, vm._update)
  vm._update(vm._watcher.value)
}

export function renderMixin (Vue) {
  Vue.prototype.__h__ = h

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
}
