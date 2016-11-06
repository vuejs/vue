/* @flow */

import { cached, camelize, extend, looseEqual } from 'shared/util'
import { normalizeBindingStyle, getStyle } from 'web/util/style'

const cssVarRE = /^--/
const setProp = (el, name, val) => {
  /* istanbul ignore if */
  if (cssVarRE.test(name)) {
    el.style.setProperty(name, val)
  } else {
    el.style[normalize(name)] = val
  }
}

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
  const data = vnode.data
  const oldData = oldVnode.data

  if (!data.staticStyle && !data.style &&
      !oldData.staticStyle && !oldData.style) {
    return
  }

  let cur, name
  const el: any = vnode.elm
  const oldStyle: any = oldVnode.data.style || {}
  const style: Object = normalizeBindingStyle(vnode.data.style || {})
  vnode.data.style = extend({}, style)

  const newStyle: Object = getStyle(vnode, true)

  if (looseEqual(el._prevStyle, newStyle)) {
    return
  }

  for (name in oldStyle) {
    if (newStyle[name] == null) {
      setProp(el, name, '')
    }
  }
  for (name in newStyle) {
    cur = newStyle[name]
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      setProp(el, name, cur == null ? '' : cur)
    }
  }
  el._prevStyle = newStyle
}

export default {
  create: updateStyle,
  update: updateStyle
}
