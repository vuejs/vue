/* @flow */

import { extend, cached, camelize } from 'shared/util'

const normalize = cached(camelize)

function createStyle (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (!vnode.data.staticStyle) {
    updateStyle(oldVnode, vnode)
    return
  }
  const elm = vnode.elm
  const staticStyle = vnode.data.staticStyle
  for (const name in staticStyle) {
    if (staticStyle[name]) {
      elm.setStyle(normalize(name), staticStyle[name])
    }
  }
  updateStyle(oldVnode, vnode)
}

function updateStyle (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (!oldVnode.data.style && !vnode.data.style) {
    return
  }
  let cur, name
  const elm = vnode.elm
  const oldStyle = oldVnode.data.style || {}
  let style = vnode.data.style || {}

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
      elm.setStyle(normalize(name), '')
    }
  }
  for (name in style) {
    cur = style[name]
    elm.setStyle(normalize(name), cur)
  }
}

function toObject (arr) {
  const res = {}
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i])
    }
  }
  return res
}

export default {
  create: createStyle,
  update: updateStyle
}
