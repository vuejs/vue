/* @flow */

import { isObject } from 'shared/util'

function StringNode (open, close, children) {
  this.isString = true
  this.open = open
  this.close = close
  this.children = children
}

export function createStringNode (
  open: string,
  close?: string,
  children?: Array<any>
) {
  return new StringNode(open, close, children)
}

export function createStringList (val: any, render: () => string): string {
  let ret = ''
  let i, l, keys, key
  if (Array.isArray(val) || typeof val === 'string') {
    for (i = 0, l = val.length; i < l; i++) {
      ret += render(val[i], i)
    }
  } else if (typeof val === 'number') {
    for (i = 0; i < val; i++) {
      ret += render(i + 1, i)
    }
  } else if (isObject(val)) {
    keys = Object.keys(val)
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i]
      ret += render(val[key], key, i)
    }
  }
  return ret
}
