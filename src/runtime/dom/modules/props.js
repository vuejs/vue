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
    if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
      elm[key] = cur
    }
  }
}

export default {
  create: updateProps,
  update: updateProps
}
