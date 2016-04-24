import { setClass } from '../class-util'
import { genClassForVnode, concat, stringifyClass } from 'web/util/index'

function updateClass (oldVnode, vnode) {
  const el = vnode.elm
  const data = vnode.data
  if (!data.staticClass && !data.class) {
    return
  }

  let cls = genClassForVnode(vnode)

  // handle transition classes
  const transitionClass = el._transitionClasses
  if (transitionClass) {
    cls = concat(cls, stringifyClass(transitionClass))
  }

  // set the class
  if (cls !== el._prevClass) {
    setClass(el, cls)
    el._prevClass = cls
  }
}

export default {
  create: updateClass,
  update: updateClass
}
