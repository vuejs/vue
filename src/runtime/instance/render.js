import Watcher from '../observer/watcher'
import { extend, query, resolveAsset, hasOwn, isArray, isObject } from '../util/index'
import { createElement, patch, updateListeners } from '../vdom/index'
import { callHook } from './lifecycle'
import { getPropValue } from './state'

export const renderState = {
  activeInstance: null,
  context: null
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

  Vue.prototype._tryUpdate = function (parentData, children, key) {
    const oldParentData = this.$options._renderData
    this.$options._renderKey = key
    this.$options._renderData = parentData
    this.$options._renderChildren = children
    // update props and listeners
    if (parentData) {
      updateProps(this, parentData)
      updateEvents(this, parentData, oldParentData)
    }
    // for now, if the component has content it always updates
    // because we don't know whether the children have changed.
    // need to optimize in the future.
    if (children || diffParentData(parentData, oldParentData)) {
      this.$forceUpdate()
    }
  }

  /**
   * Call a render function with this instance as the context.
   * This is used to wrap all children thunks in codegen.
   */

  Vue.prototype._withContext = function (fn) {
    return () => {
      const prev = renderState.context
      renderState.context = this
      const children = fn()
      renderState.context = prev
      return children
    }
  }

  Vue.prototype._render = function () {
    const prev = renderState.activeInstance
    renderState.activeInstance = this
    const { render, _renderKey, _renderData, _renderChildren } = this.$options
    // resolve slots. becaues slots are rendered in parent scope,
    // we set the activeInstance to parent.
    if (_renderChildren) {
      resolveSlots(this, _renderChildren)
    }
    // render self
    const vnode = render.call(this)
    // set key
    vnode.key = _renderKey
    // update parent data
    if (_renderData) {
      mergeParentData(this, vnode.data, _renderData)
    }
    // restore render state
    renderState.activeInstance = prev
    return vnode
  }

  Vue.prototype.$mount = function (el) {
    callHook(this, 'beforeMount')
    el = this.$el = el && query(el)
    if (el) {
      // clean element
      el.innerHTML = ''
      if (el.hasAttributes()) {
        const attrs = el.attributes
        for (let i = 0, l = attrs.length; i < l; i++) {
          el.removeAttribute(attrs[i].name)
        }
      }
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

function resolveSlots (vm, children) {
  if (children) {
    children = children().slice()
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

function diffParentData (data, oldData) {
  const keys = Object.keys(oldData)
  let key, old, cur, i, l, j, k
  for (i = 0, l = keys.length; i < l; i++) {
    key = keys[i]
    cur = data[key]
    old = oldData[key]
    if (key === 'on') continue
    if (!cur) return true
    if (isArray(old)) {
      if (!isArray(cur)) return true
      if (cur.length !== old.length) return true
      for (j = 0, k = old.length; j < k; j++) {
        if (isObject(old[i])) {
          if (!isObject(cur[i])) return true
          if (diffObject(cur, old)) return true
        } else if (old[i] !== cur[i]) {
          return true
        }
      }
    } else if (diffObject(cur, old)) {
      return true
    }
  }
  return false
}

function diffObject (cur, old) {
  const keys = Object.keys(old)
  let i, l, key
  for (i = 0, l = keys.length; i < l; i++) {
    key = keys[i]
    if (cur[key] !== old[key]) return true
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
    if (!data.class) {
      data.class = parentData.class
    } else {
      data.class = (isArray(data.class) ? data.class : []).concat(parentData.class)
    }
  }
  if (parentData.style) {
    if (!data.style) {
      data.style = parentData.style
    } else {
      extend(data.style, parentData.style)
    }
  }
  if (parentData.directives) {
    data.directives = parentData.directives.conact(data.directives || [])
  }
}

function updateProps (vm, data) {
  if (data.attrs || data.props) {
    for (let key in vm.$options.props) {
      vm[key] = getPropValue(data, key)
    }
  }
}

function updateEvents (vm, data, oldData) {
  if (data.on) {
    updateListeners(data.on, oldData.on || {}, (event, handler) => {
      console.log(11)
      vm.$on(event, handler)
    })
  }
}
