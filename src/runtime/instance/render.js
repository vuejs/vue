import Watcher from '../observer/watcher'
import { query } from '../util/index'
import { h, patch } from '../vdom/index'
import { callHook } from './lifecycle'

export function initRender (vm) {
  const el = vm.$options.el
  if (el) {
    vm.$mount(el)
  }
}

export function renderMixin (Vue) {
  Vue.prototype.__h__ = h

  Vue.prototype._update = function (vtree) {
    callHook(this, 'beforeUpdate')
    if (!this._tree) {
      patch(this.$el, vtree)
    } else {
      patch(this._tree, vtree)
    }
    this._tree = vtree
    callHook(this, 'updated')
  }

  Vue.prototype.$mount = function (el) {
    callHook(this, 'beforeMount')
    this.$el = el ? query(el) : document.createElement('div')
    this.$el.innerHTML = ''
    this._watcher = new Watcher(this, this.$options.render, this._update)
    this._update(this._watcher.value)
    callHook(this, 'mounted')
  }

  Vue.prototype.$forceUpdate = function () {
    this._watcher.run()
  }
}
