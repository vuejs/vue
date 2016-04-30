import { resolveAsset } from 'core/util/options'

export default {
  create: function bindDirectives (oldVnode, vnode) {
    applyDirectives(oldVnode, vnode, 'bind')
  },
  update: function updateDirectives (oldVnode, vnode) {
    applyDirectives(oldVnode, vnode, 'update', true)
  },
  destroy: function unbindDirectives (vnode) {
    applyDirectives(null, vnode, 'unbind')
  }
}

function applyDirectives (oldVnode, vnode, hook, update) {
  const dirs = vnode.data.directives
  if (dirs) {
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i]
      const def = resolveAsset(vnode.context.$options, 'directives', dir.name, true)
      const fn = def && def[hook]
      if (fn) {
        // only call update if value has changed
        if (update) {
          const oldValue = oldVnode.data.directives[i].value
          if (oldValue === dir.value) {
            continue
          }
        }
        fn(vnode.elm, dir.value, dir.modifiers, vnode, oldVnode)
      }
    }
  }
}
