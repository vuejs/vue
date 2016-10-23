/* @flow */

import VNode, { emptyVNode } from './vnode'
import config from '../config'
import { createComponent } from './create-component'
import { normalizeChildren } from './helpers/index'
import { warn, resolveAsset, toArray } from '../util/index'

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
export function createElement (
  tag: any,
  data: any,
  children: any
): VNode | void {
  var len = arguments.length
  var str = typeof tag === 'string'
  var yes

  // check for enhanced render arguments
  if (len > 3 || tag === '' || (str && (tag.charAt(0) === '.' || tag.match(/[.@!]/)))) {
    yes = 1
  } else if (str && len > 1) {
    var end = arguments[len - 1]
    var aos = Array.isArray(end) || typeof end === 'string'
    if (!(len === 2 && aos)) {
      var uno = data === undefined || data === null || typeof data === 'object' && data.constructor.name === 'Object'
      yes = !((len === 2 && uno) || (len === 3 && uno && aos))
    }
  }

  // process enhanced render arguments
  if (yes) {
    var raw
    var ary = toArray(arguments)
    var cls = []
    var id

    // check for tag, class, id, and trailing "!" (unsafe HTML)
    tag = ary.shift()
    if (str) {
      len = tag.length
      if (tag.charAt(len - 1) === '!') {
        raw = true
        tag = tag.slice(0, len - 1)
      }

      // check for tag, class, and id values
      var all = tag.split(/([.@])/)
      tag = all[0] || 'div'
      len = all.length
      for (var pos = 0; ++pos < len;) {
        if (all[pos++].charAt(0) === '.') {
          cls.push(all[pos])
        } else {
          id = all[pos]
        }
      }
    }

    // process obj
    var obj = ary.shift()
    str = obj != null ? obj.constructor.name : null
    if (str === 'Number' || str === 'Boolean') {
      if (!obj) return
      obj = undefined
    } else if (str !== 'Object') {
      ary.unshift(obj)
      obj = undefined
    }

    if (cls || id || raw) {
      if (!obj) obj = {}
      if (cls) obj.staticClass = cls.join(' ')
      if (id) obj.attrs = { id: id }
      if (raw) obj.domProps = { innerHTML: ary.shift() }
    }

    // invoke virtual dom
    return _createElement(this._self, tag, obj, ary)
  }

  if (data && (Array.isArray(data) || typeof data !== 'object')) {
    children = data
    data = undefined
  }
  // make sure to use real instance instead of proxy as context
  return _createElement(this._self, tag, data, children)
}

function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: VNodeChildren | void
): VNode | void {
  if (data && data.__ob__) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return emptyVNode()
  }
  if (typeof tag === 'string') {
    let Ctor
    const ns = config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      return new VNode(
        tag, data, normalizeChildren(children, ns),
        undefined, undefined, ns, context
      )
    } else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      return createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      return new VNode(
        tag, data, normalizeChildren(children, ns),
        undefined, undefined, ns, context
      )
    }
  } else {
    // direct component options / constructor
    return createComponent(tag, data, context, children)
  }
}
