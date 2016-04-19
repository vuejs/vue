export default {
  create: function (oldVnode, vnode) {
    applyDirectives(oldVnode, vnode, 'bind')
  },
  update: function (oldVnode, vnode) {
    applyDirectives(oldVnode, vnode, 'update', true)
  },
  destroy: function (vnode) {
    applyDirectives(null, vnode, 'unbind')
  }
}

function applyDirectives (oldVnode, vnode, hook, update) {
  const dirs = vnode.data.directives
  if (dirs) {
    for (let i = 0; i < dirs.length; i++) {
      let dir = dirs[i]
      let fn = dir.def && dir.def[hook]
      if (fn) {
        // only call update if value has changed
        if (update) {
          let oldValue = oldVnode.data.directives[i].value
          if (oldValue === dir.value) {
            continue
          }
        }
        fn(vnode.elm, dir.value, dir.modifiers)
      }
    }
  }
}
