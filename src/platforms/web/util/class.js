import { extend, isArray, isObject } from 'shared/util'

export function genClassForVnode (vnode) {
  let data = vnode.data
  // Important: check if this is a component container node
  // or a child component root node
  let i
  if ((i = vnode.child) && (i = i._vnode.data)) {
    data = mergeClassData(i, data)
  }
  if ((i = vnode.parent) && (i = i.data)) {
    data = mergeClassData(data, i)
  }
  return genClassFromData(data)
}

function mergeClassData (child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: child.class ? extend(child.class, parent.class) : parent.class
  }
}

function genClassFromData (data) {
  const dynamicClass = data.class
  const staticClass = data.staticClass
  if (staticClass || dynamicClass) {
    return concat(staticClass, resolveClass(dynamicClass))
  }
}

export function concat (a, b) {
  return a ? b ? a.concat(b) : a : (b || [])
}

export function resolveClass (value) {
  if (!value) {
    return []
  }
  if (typeof value === 'string') {
    return value.split(' ')
  }
  if (isArray(value)) {
    const res = []
    for (let i = 0, l = value.length; i < l; i++) {
      if (value[i]) res.concat(resolveClass(value[i]))
    }
    return res
  }
  if (isObject(value)) {
    const res = []
    for (const key in value) {
      if (value[key]) res.push(key)
    }
    return res
  }
}
