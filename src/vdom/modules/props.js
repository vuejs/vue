function updateProps(oldVnode, vnode) {
  var key, cur, old, elm = vnode.elm,
      oldProps = oldVnode.data.props || {}, props = vnode.data.props || {}
  for (key in oldProps) {
    if (!props[key]) {
      delete elm[key]
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
