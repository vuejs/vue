/* @flow */

function updateDOMProps (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (!oldVnode.data.domProps && !vnode.data.domProps) {
    return
  }
  let key, cur
  const elm: any = vnode.elm
  const oldProps = oldVnode.data.domProps || {}
  const props = vnode.data.domProps || {}
  const clonedProps = vnode.data.domProps = {}

  for (key in oldProps) {
    if (props[key] == null) {
      elm[key] = undefined
    }
  }
  for (key in props) {
    cur = clonedProps[key] = props[key]
    if (key === 'value') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur
      // avoid resetting cursor position when value is the same
      const strCur = cur == null ? '' : String(cur)
      if (elm.value !== strCur) {
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
