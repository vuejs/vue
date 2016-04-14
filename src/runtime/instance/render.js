import Watcher from '../observer/watcher'
import { query, resolveAsset } from '../util/index'
import { h, patch } from '../vdom/index'
import { callHook } from './lifecycle'

export function initRender (vm) {
  const el = vm.$options.el
  if (el) {
    vm.$mount(el)
  }
}

export function renderMixin (Vue) {
  // shorthands used in render functions
  Vue.prototype.__h__ = h
  Vue.prototype.__d__ = function (id) {
    return resolveAsset(this.$options, 'directives', id, true)
  }

  Vue.prototype._update = function (vtree) {
    callHook(this, 'beforeUpdate')
    if (!this._tree) {
      this.$el = patch(this.$el, vtree)
    } else {
      this.$el = patch(this._tree, vtree)
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
