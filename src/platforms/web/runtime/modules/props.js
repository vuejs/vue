/* @flow */

function updateProps (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (!oldVnode.data.props && !vnode.data.props) {
    return
  }
  let key, cur, old
  const elm: any = vnode.elm
  const oldProps = oldVnode.data.props || {}
  const props = vnode.data.props || {}

  for (key in oldProps) {
    if (props[key] == null) {
      elm[key] = undefined
    }
  }
  for (key in props) {
    cur = props[key]
    if (key === 'value') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur
      // avoid resetting cursor position when value is the same
      if (elm.value != cur) { // eslint-disable-line
        elm.value = cur
      }
    } else {
      elm[key] = cur
    }
  }
}

export default {
  create: updateProps,
  update: updateProps
}
