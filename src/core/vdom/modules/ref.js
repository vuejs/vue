/* @flow */

export default {
  create: registerRef,
  update: registerRef
}

export function registerRef (_: any, vnode: VNodeWithData) {
  const key = vnode.data.ref
  if (!key) return

  const ref = vnode.componentInstance || vnode.elm
  const refs = vnode.context.$refs

  if (typeof key === 'function') {
    key(ref)
  } else if (vnode.data.refInFor) {
    const refArray = refs[key]
    if (Array.isArray(refArray)) {
      if (refArray.indexOf(ref) < 0) {
        refArray.push(ref)
      }
    } else {
      refs[key] = [ref]
    }
  } else {
    refs[key] = ref
  }
}

export function resetRefs (refs: Refs): Refs {
  const res = {}
  // keep existing v-for ref arrays even if empty
  for (const key in refs) {
    if (Array.isArray(refs[key])) {
      res[key] = []
    }
  }
  return res
}
