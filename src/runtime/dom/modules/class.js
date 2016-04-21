import { extend, isArray, isObject } from '../../util/index'
import { setClass } from '../class-util'

function updateClass (oldVnode, vnode) {
  const el = vnode.elm
  let data = vnode.data
  if (!data.staticClass && !data.class) {
    return
  }

  // check if this is a component container node
  // or a child component root node
  let i
  if ((i = vnode.child) && (i = i._vnode.data)) {
    data = mergeClassData(i, data)
  }
  if ((i = vnode.parent) && (i = i.data)) {
    data = mergeClassData(data, i)
  }

  let cls = genClass(data)

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

function mergeClassData (child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: child.class ? extend(child.class, parent.class) : parent.class
  }
}

function genClass (data) {
  const dynamicClass = data.class
  const staticClass = data.staticClass
  if (staticClass || dynamicClass) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
}

function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

function stringifyClass (data) {
  if (!data) {
    return ''
  }
  if (typeof data === 'string') {
    return data
  }
  if (isArray(data)) {
    let res = ''
    for (let i = 0, l = data.length; i < l; i++) {
      if (data[i]) res += stringifyClass(data[i]) + ' '
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
