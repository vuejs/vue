/* @flow */

import { resolveAsset } from 'core/util/options'

export default {
  create: function bindDirectives (oldVnode: VNodeWithData, vnode: VNodeWithData) {
    applyDirectives(oldVnode, vnode, 'bind')
  },
  update: function updateDirectives (oldVnode: VNodeWithData, vnode: VNodeWithData) {
    applyDirectives(oldVnode, vnode, 'update')
  },
  postpatch: function postupdateDirectives (oldVnode: VNodeWithData, vnode: VNodeWithData) {
    applyDirectives(oldVnode, vnode, 'postupdate')
  },
  destroy: function unbindDirectives (vnode: VNodeWithData) {
    applyDirectives(vnode, vnode, 'unbind')
  }
}

function applyDirectives (
  oldVnode: VNodeWithData,
  vnode: VNodeWithData,
  hook: string
) {
  const dirs = vnode.data.directives
  const oldDirs = oldVnode.data.directives
  const isUpdate = hook === 'update'
  if (dirs) {
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i]
      const def = resolveAsset(vnode.context.$options, 'directives', dir.name, true)
      const fn = def && def[hook]
      if (fn) {
        // only call update if value has changed
        if (isUpdate && oldDirs) {
          const oldValue = dir.oldValue = oldDirs[i].value
          if (oldValue === dir.value) {
            continue
          }
        }
        fn(vnode.elm, dir, vnode, oldVnode)
      }
    }
  }
}
