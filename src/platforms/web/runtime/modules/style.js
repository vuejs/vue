/* @flow */

import { cached, camelize, toObject, extend } from 'shared/util'

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
  if (!oldVnode.data.style && !vnode.data.style) {
    return
  }
  let cur, name
  const elm: any = vnode.elm
  const oldStyle: any = oldVnode.data.style || {}
  let style = vnode.data.style || {}

  // handle array syntax
  if (Array.isArray(style)) {
    style = vnode.data.style = toObject(style)
  }

  for (name in oldStyle) {
    if (!style[name]) {
      elm.style[normalize(name)] = ''
    }
  }
  for (name in style) {
    cur = style[name]
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      elm.style[normalize(name)] = cur || ''
    }
  }
  // clone the style for future updates,
  // in case the user mutates the style object in-place.
  vnode.data.style = extend({}, style)
}

export default {
  create: updateStyle,
  update: updateStyle
}
