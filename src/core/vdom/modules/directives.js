/* @flow */

import { resolveAsset } from 'core/util/options'

export default {
  create: function bindDirectives (oldVnode: VNodeWithData, vnode: VNodeWithData) {
    applyDirectives(oldVnode, vnode, 'bind')
  },
  update: function updateDirectives (oldVnode: VNodeWithData, vnode: VNodeWithData) {
    applyDirectives(oldVnode, vnode, 'update')
    // if old vnode has directives but new vnode doesn't
    // we need to teardown the directives on the old one.
    if (oldVnode.data.directives && !vnode.data.directives) {
      applyDirectives(oldVnode, oldVnode, 'unbind')
    }
  },
  postpatch: function postupdateDirectives (oldVnode: VNodeWithData, vnode: VNodeWithData) {
    applyDirectives(oldVnode, vnode, 'componentUpdated')
  },
  destroy: function unbindDirectives (vnode: VNodeWithData) {
    applyDirectives(vnode, vnode, 'unbind')
  }
}

const emptyModifiers = Object.create(null)

function applyDirectives (
  oldVnode: VNodeWithData,
  vnode: VNodeWithData,
  hook: string
) {
  const dirs = vnode.data.directives
  if (dirs) {
    const oldDirs = oldVnode.data.directives
    const isUpdate = hook === 'update' || hook === 'componentUpdated'
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i]
      const def = resolveAsset(vnode.context.$options, 'directives', dir.name, true)
      const fn = def && def[hook]
      if (fn) {
        if (isUpdate && oldDirs) {
          dir.oldValue = oldDirs[i].value
        }
        if (!dir.modifiers) {
          dir.modifiers = emptyModifiers
        }
        fn(vnode.elm, dir, vnode, oldVnode)
      }
    }
  }
}
