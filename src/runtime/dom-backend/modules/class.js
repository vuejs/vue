import { isArray, isObject } from '../../util/index'
import { setClass } from '../class-util'

function updateClass (oldVnode, vnode) {
  let dynamicClass = vnode.data.class
  let staticClass = vnode.data.staticClass
  const el = vnode.elm
  const activeClass = el._activeClass
  if (staticClass || dynamicClass || activeClass) {
    dynamicClass = genClass(dynamicClass)
    const cls = concatClass(concatClass(staticClass, dynamicClass), activeClass)
    if (cls !== oldVnode.class) {
      setClass(el, cls)
    }
    vnode.class = cls
  }
}

function concatClass (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

function genClass (data) {
  if (!data) {
    return ''
  }
  if (isObject(data)) {
    let res = ''
    for (var key in data) {
      if (data[key]) res += key + ' '
    }
    return res.slice(0, -1)
  }
  if (isArray(data)) {
    let res = ''
    for (let i = 0, l = data.length; i < l; i++) {
      if (data[i]) res += genClass(data[i]) + ' '
    }
    return res.slice(0, -1)
  }
  if (typeof data === 'string') {
    return data
  }
}

export default {
  create: updateClass,
  update: updateClass
}
