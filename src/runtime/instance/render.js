import Watcher from '../observer/watcher'
import { query } from '../util/index'
import { h, patch } from '../vdom/index'

export function initRender (vm) {
  const el = vm.$options.el
  if (el) {
    vm.$mount(el)
  }
}

export function renderMixin (Vue) {
  Vue.prototype.__h__ = h

  Vue.prototype._update = function (vtree) {
    if (!this._tree) {
      patch(this.$el, vtree)
    } else {
      patch(this._tree, vtree)
    }
    this._tree = vtree
  }

  Vue.prototype.$mount = function (el) {
    this.$el = el ? query(el) : document.createElement('div')
    this.$el.innerHTML = ''
    this._watcher = new Watcher(this, this.$options.render, this._update)
    this._update(this._watcher.value)
  }

  Vue.prototype.$forceUpdate = function () {
    this._watcher.run()
  }
}
