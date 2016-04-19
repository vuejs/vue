import { isArray, isObject } from '../../util/index'
import { setClass } from '../class-util'

function updateClass (oldVnode, vnode) {
  const el = vnode.elm
  let dynamicClass = vnode.data.class
  let staticClass = vnode.data.staticClass
  let transitionClass = el._transitionClasses
  if (staticClass || dynamicClass || transitionClass) {
    dynamicClass = genClass(dynamicClass)
    transitionClass = genClass(transitionClass)
    const cls = concat(concat(staticClass, dynamicClass), transitionClass)
    if (cls !== oldVnode.class) {
      console.log(cls)
      setClass(el, cls)
    }
    vnode.class = cls
  }
}

function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

function genClass (data) {
  if (!data) {
    return ''
  }
  if (typeof data === 'string') {
    return data
  }
  if (isArray(data)) {
    let res = ''
    for (let i = 0, l = data.length; i < l; i++) {
      if (data[i]) res += genClass(data[i]) + ' '
    }
    return res.slice(0, -1)
  }
  if (isObject(data)) {
    let res = ''
    for (var key in data) {
      if (data[key]) res += key + ' '
    }
    return res.slice(0, -1)
  }
}

export default {
  create: updateClass,
  update: updateClass
}
