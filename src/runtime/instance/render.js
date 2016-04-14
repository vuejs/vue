import Watcher from '../observer/watcher'
import { query, resolveAsset, hyphenate } from '../util/index'
import { createElement, patch } from '../vdom/index'
import { callHook } from './lifecycle'

export const renderState = {
  activeInstance: null
}

export function initRender (vm) {
  vm._vnode = null
  vm._mounted = false
  vm._renderData = vm.$options._renderData
  vm.$slots = resolveSlots(vm.$options._renderChildren)
  const el = vm.$options.el
  if (el) {
    vm.$mount(el)
  }
}

function resolveSlots (children) {
  const slots = {
    default: children
  }
  if (children) {
    let i = children.length
    let name, child
    while (i--) {
      child = children[i]
      if ((name = child.data && child.data.slot)) {
        (slots[name] || (slots[name] = [])).push(child)
        children.splice(i, 1)
      }
    }
  }
  return slots
}

export function renderMixin (Vue) {
  // shorthands used in render functions
  Vue.prototype.__h__ = createElement
  Vue.prototype.__d__ = function (id) {
    return resolveAsset(this.$options, 'directives', id, true)
  }

  Vue.prototype._update = function (vnode) {
    callHook(this, 'beforeUpdate')
    if (!this._vnode) {
      this.$el = patch(this.$el, vnode)
    } else {
      this.$el = patch(this._vnode, vnode)
    }
    this._vnode = vnode
    callHook(this, 'updated')
  }

  Vue.prototype._tryUpdate = function (data, children) {
    this._renderData = data
    this.$slots = resolveSlots(children)
    if (children) {
      this.$forceUpdate()
      return
    }
    // check props
    if (data && data.attrs) {
      for (let key in this.$options.props) {
        let oldVal = this[key]
        let newVal = data.attrs[key] || data.attrs[hyphenate(key)]
        if (oldVal !== newVal) {
          this.$forceUpdate()
        }
      }
    }
  }

  Vue.prototype._render = function () {
    const prev = renderState.activeInstance
    renderState.activeInstance = this
    const vnode = this.$options.render.call(this)
    // merge parent data
    // TODO
    renderState.activeInstance = prev
    return vnode
  }

  Vue.prototype.$mount = function (el) {
    callHook(this, 'beforeMount')
    this.$el = el && query(el)
    if (this.$el) {
      this.$el.innerHTML = ''
    }
    this._watcher = new Watcher(this, this._render, this._update)
    this._update(this._watcher.value)
    callHook(this, 'mounted')
    this._mounted = true
    return this
  }

  Vue.prototype.$forceUpdate = function () {
    this._watcher.update()
  }
}
