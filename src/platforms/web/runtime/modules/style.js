/* @flow */

import { cached, extend, camelize, toObject } from 'shared/util'

const prefixes = ['Webkit', 'Moz', 'ms']

let testEl
const normalize = cached(function (prop) {
  testEl = testEl || document.createElement('div')
  prop = camelize(prop)
  if (prop !== 'filter' && (prop in testEl.style)) {
    return prop
  }
  const upper = prop.charAt(0).toUpperCase() + prop.slice(1)
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + upper
    if (prefixed in testEl.style) {
      return prefixed
    }
  }
})

function updateStyle (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if ((!oldVnode.data || !oldVnode.data.style) && !vnode.data.style) {
    return
  }
  let cur, name
  const el: any = vnode.elm
  const oldStyle: any = oldVnode.data.style || {}
  let style: any = vnode.data.style || {}

  // handle string
  if (typeof style === 'string') {
    el.style.cssText = style
    return
  }

  const needClone = style.__ob__

  // handle array syntax
  if (Array.isArray(style)) {
    style = vnode.data.style = toObject(style)
  }

  // clone the style for future updates,
  // in case the user mutates the style object in-place.
  if (needClone) {
    style = vnode.data.style = extend({}, style)
  }

  for (name in oldStyle) {
    if (!style[name]) {
      el.style[normalize(name)] = ''
    }
  }
  for (name in style) {
    cur = style[name]
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      el.style[normalize(name)] = cur == null ? '' : cur
    }
  }
}

export default {
  create: updateStyle,
  update: updateStyle
}
