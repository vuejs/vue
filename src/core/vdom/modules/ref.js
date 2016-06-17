/* flow */

import { remove } from 'shared/util'

export default {
  create (_, vnode) {
    registerRef(vnode)
  },
  update (oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true)
      registerRef(vnode)
    }
  },
  destroy (vnode) {
    registerRef(vnode, true)
  }
}

function registerRef (vnode: VNodeWithData, isRemoval: ?boolean) {
  const key = vnode.data.ref
  if (!key) return

  const vm = vnode.context
  const ref = vnode.child || vnode.elm
  const refs = vm.$refs
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref)
    } else if (refs[key] === ref) {
      refs[key] = undefined
    }
  } else {
    if (vnode.data.refInFor) {
      if (Array.isArray(refs[key])) {
        refs[key].push(ref)
      } else {
        refs[key] = [ref]
      }
    } else {
      refs[key] = ref
    }
  }
}
