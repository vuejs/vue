function updateProps (oldVnode, vnode) {
  if (!oldVnode.data.props && !vnode.data.props) {
    return
  }
  let key, cur, old
  const elm = vnode.elm
  const oldProps = oldVnode.data.props || {}
  const props = vnode.data.props || {}

  for (key in oldProps) {
    if (props[key] == null) {
      elm[key] = undefined
    }
  }
  for (key in props) {
    cur = props[key]
    old = oldProps[key]
    if (old !== cur) {
      if (key === 'value') {
        // store value as _value as well since
        // non-string values will be stringified
        if (elm._value !== cur) {
          elm.value = elm._value = cur
        }
      } else {
        elm[key] = cur
      }
    }
  }
}

export default {
  create: updateProps,
  update: updateProps
}
