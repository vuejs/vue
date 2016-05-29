/* @flow */

import { isObject } from 'shared/util'

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
  class: any
} {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: child.class
      ? [child.class, parent.class]
      : parent.class
  }
}

function genClassFromData (data: Object): string {
  const dynamicClass = data.class
  const staticClass = data.staticClass
  if (staticClass || dynamicClass) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
  /* istanbul ignore next */
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
    let stringified
    for (let i = 0, l = value.length; i < l; i++) {
      if (value[i]) {
        if ((stringified = stringifyClass(value[i]))) {
          res += stringified + ' '
        }
      }
    }
    return res.slice(0, -1)
  }
  if (isObject(value)) {
    for (const key in value) {
      if (value[key]) res += key + ' '
    }
    return res.slice(0, -1)
  }
  /* istanbul ignore next */
  return res
}
