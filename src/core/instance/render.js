import createElement from '../vdom/create-element'
import { flatten } from '../vdom/helpers'
import { bind, resolveAsset, isArray, isObject } from '../util/index'

export const renderState = {
  activeInstance: null
}

export function initRender (vm) {
  vm._vnode = null
  vm._mounted = false
  vm._staticTrees = null
  vm.$slots = {}
  // bind the public createElement fn to this instance
  // so that we get proper render context inside it.
  vm.$createElement = bind(createElement, vm)
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
}

export function renderMixin (Vue) {
  Vue.prototype._render = function () {
    const prev = renderState.activeInstance
    renderState.activeInstance = this
    const { render, _renderChildren } = this.$options
    // resolve slots. becaues slots are rendered in parent scope,
    // we set the activeInstance to parent.
    if (_renderChildren) {
      resolveSlots(this, _renderChildren)
    }
    // render self
    const vnode = render.call(this._renderProxy)
    // restore render state
    renderState.activeInstance = prev
    return vnode
  }

  // shorthands used in render functions
  Vue.prototype.__h__ = createElement

  Vue.prototype.__static__ = function (id) {
    return this._staticTrees[id]
  }

  // resolve directive
  Vue.prototype.__resolveDirective__ = function (id) {
    return resolveAsset(this.$options, 'directives', id, true)
  }

  // resolve transition
  Vue.prototype.__resolveTransition__ = function (id, appear) {
    const definition = id && typeof id === 'string'
      ? resolveAsset(this.$options, 'transitions', id) || id
      : id
    return { definition, appear, context: this }
  }

  // toString for mustaches
  Vue.prototype.__toString__ = function (val) {
    return val == null
      ? ''
      : typeof val === 'object'
        ? JSON.stringify(val, null, 2)
        : val
  }

  // render v-for
  Vue.prototype.__renderList__ = function (val, render) {
    let ret, i, l, keys, key
    if (isArray(val)) {
      ret = new Array(val.length)
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i, i)
      }
    } else if (typeof val === 'number') {
      ret = new Array(val)
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i, i)
      }
    } else if (isObject(val)) {
      keys = Object.keys(val)
      ret = new Array(keys.length)
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i]
        ret[i] = render(val[key], i, key)
      }
    }
    return ret
  }

  // register ref
  Vue.prototype.__registerRef__ = function (key, ref, vFor, remove) {
    const refs = this.$refs
    if (remove) {
      if (vFor) {
        remove(refs[key], ref)
      } else {
        refs[key] = undefined
      }
    } else {
      if (vFor) {
        if (refs[key]) {
          refs[key].push(ref)
        } else {
          refs[key] = [ref]
        }
      } else {
        refs[key] = ref
      }
    }
  }
}

function resolveSlots (vm, children) {
  if (children) {
    children = flatten(isArray(children) ? children : children())
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
