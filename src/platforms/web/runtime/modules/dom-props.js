/* @flow */

import { extend } from 'shared/util'

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
      elm[key] = undefined
    }
  }
  for (key in props) {
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if ((key === 'textContent' || key === 'innerHTML') && vnode.children) {
      vnode.children.length = 0
    }
    cur = props[key]
    if (key === 'value') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur
      // avoid resetting cursor position when value is the same
      const strCur = cur == null ? '' : String(cur)
      if (elm.value !== strCur && !elm.composing) {
        elm.value = strCur
      }
    } else {
      elm[key] = cur
    }
  }
}

export default {
  create: updateDOMProps,
  update: updateDOMProps
}
