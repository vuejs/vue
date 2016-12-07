/* @flow */

import { extend, toNumber } from 'shared/util'

function updateDOMProps (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (!oldVnode.data.domProps && !vnode.data.domProps) {
    return
  }
  let key, cur
  const elm: any = vnode.elm
  const oldProps = oldVnode.data.domProps || {}
  let props = vnode.data.domProps || {}
  // clone observed objects, as the user probably wants to mutate it
  if (props.__ob__) {
    props = vnode.data.domProps = extend({}, props)
  }

  for (key in oldProps) {
    if (props[key] == null) {
      elm[key] = ''
    }
  }
  for (key in props) {
    cur = props[key]
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if (key === 'textContent' || key === 'innerHTML') {
      if (vnode.children) vnode.children.length = 0
      if (cur === oldProps[key]) continue
    }
    if (key === 'value') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur
      // avoid resetting cursor position when value is the same
      const strCur = cur == null ? '' : String(cur)
      if (!elm.composing && (
          (document.activeElement !== elm && elm.value !== strCur) ||
          isValueChanged(vnode, strCur)
      )) {
        elm.value = strCur
      }
    } else {
      elm[key] = cur
    }
  }
}

function isValueChanged (vnode: VNodeWithData, val: string): boolean {
  const value = vnode.elm.value
  const modifiers = getModelModifier(vnode)
  const needNumber = (modifiers && modifiers.number) || vnode.elm.type === 'number'
  const needTrim = modifiers && modifiers.trim
  if (needNumber) {
    return toNumber(value, val) !== toNumber(val)
  }
  if (needTrim) {
    return value.trim() !== val.trim()
  }
  return value !== val
}

function getModelModifier (vnode: VNodeWithData): ASTModifiers | void {
  const directives = vnode.data.directives || []
  for (let i = 0, directive; i < directives.length; i++) {
    directive = directives[i]
    if (directive.name === 'model') {
      return directive.modifiers
    }
  }
  return undefined
}

export default {
  create: updateDOMProps,
  update: updateDOMProps
}
