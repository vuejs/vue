/* @flow */

import { resolveAsset } from 'core/util/options'
import { mergeVNodeHook } from 'core/vdom/helpers'
import { emptyNode } from 'core/vdom/patch'

export default {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode: VNodeWithData) {
    updateDirectives(vnode, emptyNode)
  }
}

function updateDirectives (
  oldVnode: VNodeWithData,
  vnode: VNodeWithData
) {
  if (!oldVnode.data.directives && !vnode.data.directives) {
    return
  }
  const isCreate = oldVnode === emptyNode
  const oldDirs = normalizeDirectives(oldVnode.data.directives, oldVnode.context)
  const newDirs = normalizeDirectives(vnode.data.directives, vnode.context)

  const dirsWithInsert = []
  const dirsWithPostpatch = []

  let key, oldDir, dir
  for (key in newDirs) {
    oldDir = oldDirs[key]
    dir = newDirs[key]
    if (!oldDir) {
      // new directive, bind
      callHook(dir, 'bind', vnode, oldVnode)
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir)
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value
      callHook(dir, 'update', vnode, oldVnode)
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir)
      }
    }
  }

  if (dirsWithInsert.length) {
    const callInsert = () => {
      dirsWithInsert.forEach(dir => {
        callHook(dir, 'inserted', vnode, oldVnode)
      })
    }
    if (isCreate) {
      mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', callInsert, 'dir-insert')
    } else {
      callInsert()
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'postpatch', () => {
      dirsWithPostpatch.forEach(dir => {
        callHook(dir, 'componentUpdated', vnode, oldVnode)
      })
    }, 'dir-postpatch')
  }

  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook(oldDirs[key], 'unbind', oldVnode)
      }
    }
  }
}

const emptyModifiers = Object.create(null)

function normalizeDirectives (
  dirs: ?Array<VNodeDirective>,
  vm: Component
): { [key: string]: VNodeDirective } {
  const res = Object.create(null)
  if (!dirs) {
    return res
  }
  let i, dir
  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i]
    res[getRawDirName(dir)] = dir
    if (!dir.modifiers) {
      dir.modifiers = emptyModifiers
    }
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true)
  }
  return res
}

function getRawDirName (dir: VNodeDirective): string {
  return dir.rawName || (
    dir.name + (
      dir.modifiers
        ? '.' + Object.keys(dir.modifiers).join('.')
        : ''
    )
  )
}

function callHook (dir, hook, vnode, oldVnode) {
  const fn = dir.def && dir.def[hook]
  if (fn) {
    fn(vnode.elm, dir, vnode, oldVnode)
  }
}
