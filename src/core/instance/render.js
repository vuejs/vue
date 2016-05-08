import createElement from '../vdom/create-element'
import { flatten } from '../vdom/helpers'
import { bind, isArray, isObject, renderString } from 'shared/util'
import { resolveAsset, nextTick } from '../util/index'

export const renderState = {
  activeInstance: null
}

export function initRender (vm) {
  vm._vnode = null
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
  Vue.prototype.$nextTick = function (fn) {
    nextTick(fn, this)
  }

  Vue.prototype._render = function () {
    if (!this._mounted) {
      // render static sub-trees for once on initial render
      renderStaticTrees(this)
    }
    const prev = renderState.activeInstance
    renderState.activeInstance = this
    const { render, _renderChildren, _parentVnode } = this.$options
    // resolve slots. becaues slots are rendered in parent scope,
    // we set the activeInstance to parent.
    if (_renderChildren) {
      resolveSlots(this, _renderChildren)
    }
    // render self
    const vnode = render.call(this._renderProxy)
    // set parent
    vnode.parent = _parentVnode
    // restore render state
    renderState.activeInstance = prev
    return vnode
  }

  // shorthands used in render functions
  Vue.prototype.__h__ = createElement

  // toString for mustaches
  Vue.prototype.__toString__ = renderString

  // filter resolution helper
  const identity = _ => _
  Vue.prototype.__resolveFilter__ = function (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
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

function renderStaticTrees (vm) {
  const staticRenderFns = vm.$options.staticRenderFns
  if (staticRenderFns) {
    vm._staticTrees = new Array(staticRenderFns.length)
    for (let i = 0; i < staticRenderFns.length; i++) {
      vm._staticTrees[i] = staticRenderFns[i].call(vm._renderProxy)
    }
  }
}

function resolveSlots (vm, renderChildren) {
  if (renderChildren) {
    const children = flatten(renderChildren())
    const slots = {}
    const defaultSlot = []
    let i = children.length
    let name, child
    while (i--) {
      child = children[i]
      if ((name = child.data && child.data.slot)) {
        const slot = (slots[name] || (slots[name] = []))
        if (child.tag === 'template') {
          slot.push.apply(slot, child.children)
        } else {
          slot.push(child)
        }
      } else {
        defaultSlot.push(child)
      }
    }
    if (defaultSlot.length && !(
      defaultSlot.length === 1 &&
      defaultSlot[0].text === ' '
    )) {
      slots['default'] = defaultSlot
    }
    vm.$slots = slots
  }
}
