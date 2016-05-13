import type Vue from 'core/instance/index'

export default class VNode {
  tag: ?string;
  data: ?Object;
  children: ?Array<VNode>;
  text: ?string;
  elm: ?Element;
  ns: ?string;
  context: ?Vue;
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
