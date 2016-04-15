import Watcher from '../observer/watcher'
import { extend, query, resolveAsset, hasOwn } from '../util/index'
import { createElement, patch, updateListeners } from '../vdom/index'
import { callHook } from './lifecycle'
import { getPropValue } from './state'

export const renderState = {
  activeInstance: null
}

export function initRender (vm) {
  vm._vnode = null
  vm._mounted = false
  vm.$slots = {}
  const el = vm.$options.el
  if (el) {
    vm.$mount(el)
  }
}

function resolveSlots (vm, children) {
  if (children) {
    children = children.slice()
    const slots = { default: children }
    let i = children.length
    let name, child
    while (i--) {
      child = children[i]
      if ((name = child.data && child.data.slot)) {
        let slot = (slots[name] || (slots[name] = []))
        if (child.tag === 'template') {
          slot.push.apply(slot, child.children)
        } else {
          slot.push(child)
        }
        children.splice(i, 1)
      }
    }
    vm.$slots = slots
  }
}

function mergeParentData (vm, data, parentData) {
  const props = vm.$options.props
  if (parentData.attrs) {
    const attrs = data.attrs || (data.attrs = {})
    for (let key in parentData.attrs) {
      if (!hasOwn(props, key)) {
        attrs[key] = parentData.attrs[key]
      }
    }
  }
  if (parentData.props) {
    const props = data.props || (data.props = {})
    for (let key in parentData.props) {
      if (!hasOwn(props, key)) {
        props[key] = parentData.props[key]
      }
    }
  }
  if (parentData.staticClass) {
    data.staticClass = data.staticClass
      ? data.staticClass + ' ' + parentData.staticClass
      : parentData.staticClass
  }
  if (parentData.class) {
    extend((data.class || (data.class = {})), parentData.class)
  }
  if (parentData.style) {
    extend((data.style || (data.style = {})), parentData.style)
  }
  if (parentData.directives) {
    data.directives = parentData.directives.conact(data.directives || [])
  }
  if (parentData.on) {
    updateListeners(parentData.on, data.on || {}, (event, handler) => {
      vm.$on(event, handler)
    })
  }
}

function updateProps (vm, data) {
  if (data.attrs || data.props) {
    for (let key in vm.$options.props) {
      let newVal = getPropValue(data, key)
      if (vm[key] !== newVal) {
        vm[key] = newVal
      }
    }
  }
}

export function renderMixin (Vue) {
  // shorthands used in render functions
  Vue.prototype.__h__ = createElement
  Vue.prototype.__d__ = function (id) {
    return resolveAsset(this.$options, 'directives', id, true)
  }

  Vue.prototype._update = function (vnode) {
    if (this._mounted) {
      callHook(this, 'beforeUpdate')
    }
    if (!this._vnode) {
      this.$el = patch(this.$el, vnode)
    } else {
      this.$el = patch(this._vnode, vnode)
    }
    this._vnode = vnode
    if (this._mounted) {
      callHook(this, 'updated')
    }
  }

  Vue.prototype._tryUpdate = function (data, children, key) {
    this.$options._renderKey = key
    this.$options._renderData = data
    this.$options._renderChildren = children
    // set props - this will trigger update if any of them changed
    // but not guaranteed
    if (data) {
      updateProps(this, data)
    }
    // for now, if the component has content it always updates
    // because we don't know whether the children have changed.
    // need to optimize in the future.
    if (children) {
      this.$forceUpdate()
      return
    }
  }

  Vue.prototype._render = function () {
    const {
      render,
      _renderKey,
      _renderData,
      _renderChildren
    } = this.$options
    // resolve slots
    if (_renderChildren) {
      resolveSlots(this, _renderChildren)
    }
    // render
    const prev = renderState.activeInstance
    renderState.activeInstance = this
    const vnode = render.call(this)
    renderState.activeInstance = prev
    // set key
    vnode.key = _renderKey
    // update parent data
    if (_renderData) {
      mergeParentData(this, vnode.data, _renderData)
    }
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
