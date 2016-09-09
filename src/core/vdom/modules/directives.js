/* @flow */

import { resolveAsset } from 'core/util/options'
import { mergeVNodeHook } from 'core/vdom/helpers'

export default {
  create: function bindDirectives (oldVnode: VNodeWithData, vnode: VNodeWithData) {
    let hasInsert = false
    forEachDirective(oldVnode, vnode, (def, dir) => {
      callHook(def, dir, 'bind', vnode, oldVnode)
      if (def.inserted) {
        hasInsert = true
      }
    })
    if (hasInsert) {
      mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', () => {
        applyDirectives(oldVnode, vnode, 'inserted')
      })
    }
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

function forEachDirective (
  oldVnode: VNodeWithData,
  vnode: VNodeWithData,
  fn: Function
) {
  const dirs = vnode.data.directives
  if (dirs) {
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i]
      const def = resolveAsset(vnode.context.$options, 'directives', dir.name, true)
      if (def) {
        const oldDirs = oldVnode && oldVnode.data.directives
        if (oldDirs) {
          dir.oldValue = oldDirs[i].value
        }
        if (!dir.modifiers) {
          dir.modifiers = emptyModifiers
        }
        fn(def, dir)
      }
    }
  }
}

function applyDirectives (
  oldVnode: VNodeWithData,
  vnode: VNodeWithData,
  hook: string
) {
  forEachDirective(oldVnode, vnode, (def, dir) => {
    callHook(def, dir, hook, vnode, oldVnode)
  })
}

function callHook (def, dir, hook, vnode, oldVnode) {
  const fn = def && def[hook]
  if (fn) {
    fn(vnode.elm, dir, vnode, oldVnode)
  }
}
