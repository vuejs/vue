/* @flow */

import { extend, isObject } from 'shared/util'

export function genClassForVnode (vnode: VNode): string {
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

function mergeClassData (child: VNodeData, parent: VNodeData): {
  staticClass: string,
  class: ?Object
} {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: child.class
      ? extend(child.class, parent.class)
      : parent.class
  }
}

function genClassFromData (data: Object): string {
  const dynamicClass = data.class
  const staticClass = data.staticClass
  if (staticClass || dynamicClass) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
  return ''
}

export function concat (a: ?string, b: ?string): string {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

export function stringifyClass (value: any): string {
  let res = ''
  if (!value) {
    return res
  }
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value)) {
    for (let i = 0, l = value.length; i < l; i++) {
      if (value[i]) res += stringifyClass(value[i]) + ' '
    }
    return res.slice(0, -1)
  }
  if (isObject(value)) {
    for (const key in value) {
      if (value[key]) res += key + ' '
    }
    return res.slice(0, -1)
  }
  return res
}
