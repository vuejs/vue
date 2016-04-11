import { setClass } from '../../util/index'

function updateClass (oldVnode, vnode) {
  if (vnode.data.class !== undefined) {
    setClass(vnode.elm, vnode.data.class || '')
  }
}

export default {
  init: updateClass,
  update: updateClass
}
