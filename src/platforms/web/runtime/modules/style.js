import { extend, isArray, cached, camelize } from '../../../../shared/util'
import { inBrowser } from '../../../../core/util/env'

const prefixes = ['Webkit', 'Moz', 'ms']
const testEl = inBrowser && document.createElement('div')

const normalize = cached(function (prop) {
  prop = camelize(prop)
  if (prop !== 'filter' && (prop in testEl.style)) {
    return prop
  }
  const upper = prop.charAt(0).toUpperCase() + prop.slice(1)
  for (let i = 0; i < prefixes.length; i++) {
    let prefixed = prefixes[i] + upper
    if (prefixed in testEl.style) {
      return prefixed
    }
  }
})

function updateStyle (oldVnode, vnode) {
  if (!oldVnode.data.style && !vnode.data.style) {
    return
  }
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
      elm.style[normalize(name)] = ''
    }
  }
  for (name in style) {
    cur = style[name]
    if (cur !== oldStyle[name]) {
      elm.style[normalize(name)] = cur
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
