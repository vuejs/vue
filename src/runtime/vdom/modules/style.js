import { extend, isArray } from '../../../shared/util'

function updateStyle (oldVnode, vnode) {
  let cur, name
  const elm = vnode.elm
  const oldStyle = oldVnode.data.style || {}
  let style = vnode.data.style || {}

  // handle array syntax
  if (isArray(style)) {
    style = vnode.data.style = toObject(style)
  }

  for (name in oldStyle) {
    if (!style[name]) {
      elm.style[name] = ''
    }
  }
  for (name in style) {
    cur = style[name]
    if (cur !== oldStyle[name]) {
      elm.style[name] = cur
    }
  }
}

function toObject (arr) {
  const res = arr[0] || {}
  for (var i = 1; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i])
    }
  }
  return res
}

export default {
  create: updateStyle,
  update: updateStyle
}
