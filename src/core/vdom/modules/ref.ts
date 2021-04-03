/* @flow */

import { remove, isDef } from 'shared/util'
import { VNodeWithData } from 'typescript/vnode'

export default {
  create(_: any, vnode: VNodeWithData) {
    registerRef(vnode)
  },
  update(oldVnode: VNodeWithData, vnode: VNodeWithData) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true)
      registerRef(vnode)
    }
  },
  destroy(vnode: VNodeWithData) {
    registerRef(vnode, true)
  },
}

export function registerRef(vnode: VNodeWithData, isRemoval?: boolean) {
  const key = vnode.data.ref
  if (!isDef(key)) return

  const vm = vnode.context
  const ref = vnode.componentInstance || vnode.elm
  const refs = vm.$refs
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      // @ts-expect-error invalid typings
      remove(refs[key], ref)
    } else if (refs[key] === ref) {
      refs[key] = undefined
    }
  } else {
    // @ts-expect-error invalid typings
    if (vnode.data.refInFor) {
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref]
        // @ts-expect-error invalid typings
      } else if (refs[key].indexOf(ref) < 0) {
        // @ts-expect-error invalid typings
        refs[key].push(ref)
      }
    } else {
      refs[key] = ref
    }
  }
}
