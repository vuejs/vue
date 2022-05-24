import { remove, isDef, isArray } from 'shared/util'
import type { VNodeWithData } from 'typescript/vnode'

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
  }
}

export function registerRef(vnode: VNodeWithData, isRemoval?: boolean) {
  const key = vnode.data.ref
  if (!isDef(key)) return

  const vm = vnode.context
  const ref = vnode.componentInstance || vnode.elm
  const refs = vm.$refs
  const obj = refs[key]
  if (isRemoval) {
    if (isArray(obj)) {
      remove(obj, ref)
    } else if (obj === ref) {
      refs[key] = undefined
    }
  } else {
    if (vnode.data.refInFor) {
      if (!isArray(obj)) {
        refs[key] = [ref]
      } else if (obj.indexOf(ref) < 0) {
        obj.push(ref)
      }
    } else {
      refs[key] = ref
    }
  }
}
