import type Vue from 'core/instance/index'

export default class VNode {
  tag: string | void;
  data: Object | void;
  children: Array<VNode> | void;
  text: string | void;
  elm: Element | void;
  ns: string | void;
  context: Vue | void;
  key: string | number | void;

  constructor (tag, data, children, text, elm, ns, context) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = ns
    this.context = context
    this.key = data && data.key
  }
}

export const emptyVNode = new VNode(undefined, undefined, undefined, '')
