/* @flow */

import { escape } from 'he'
import { isObject } from 'shared/util'

export function installSSRHelpers (vm: Component) {
  let Ctor = vm.constructor
  while (Ctor.super) {
    Ctor = Ctor.super
  }
  if (!Ctor.prototype._ssrNode) {
    Ctor.prototype._ssrNode = createStringNode
    Ctor.prototype._ssrList = createStringList
    Ctor.prototype._ssrEscape = escape
  }
}

export class StringNode {
  isString: boolean;
  open: string;
  close: ?string;
  children: ?Array<any>;

  constructor (open: string, close?: string, children?: Array<any>) {
    this.isString = true
    this.open = open
    this.close = close
    this.children = children
  }
}

function createStringNode (
  open: string,
  close?: string,
  children?: Array<any>
) {
  return new StringNode(open, close, children)
}

function createStringList (val: any, render: () => string): string {
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
