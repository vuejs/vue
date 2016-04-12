import { observe } from '../observer/index'
import Watcher from '../observer/watcher'
import { h, patch } from '../vdom/index'
import { nextTick, isReserved } from '../util/index'

export default function Component (options) {
  this.$options = options
  this._data = options.data
  const el = this._el = document.querySelector(options.el)
  this._el.innerHTML = ''
  Object.keys(options.data).forEach(key => proxy(this, key))
  if (options.methods) {
    Object.keys(options.methods).forEach(key => {
      this[key] = options.methods[key].bind(this)
    })
  }
  this._ob = observe(options.data)
  this._watchers = []
  this._watcher = new Watcher(this, options.render, this._update)
  this._update(this._watcher.value)
}

Component.prototype._update = function (vtree) {
  if (!this._tree) {
    patch(this._el, vtree)
  } else {
    patch(this._tree, vtree)
  }
  this._tree = vtree
}

function proxy (vm, key) {
  if (!isReserved(key)) {
    Object.defineProperty(vm, key, {
      configurable: true,
      enumerable: true,
      get: function proxyGetter () {
        return vm._data[key]
      },
      set: function proxySetter (val) {
        vm._data[key] = val
      }
    })
  }
}

Component.prototype.__h__ = h
Component.nextTick = nextTick
