/* @flow */

export default class VNode {
  tag: string | void;
  data: VNodeData | void;
  children: Array<VNode> | void;
  text: string | void;
  elm: Node | void;
  ns: string | void;
  context: Component | void;
  key: string | number | void;
  componentOptions: VNodeComponentOptions | void;
  child: Component | void;
  parent: VNode | void;

  constructor (
    tag?: string,
    data?: VNodeData,
    children?: Array<VNode>,
    text?: string,
    elm?: Node,
    ns?: string,
    context?: Component,
    componentOptions?: VNodeComponentOptions
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = ns
    this.context = context
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.child = undefined
    this.parent = undefined
    // apply construct hook.
    // this is applied during render, before patch happens.
    // unlike other hooks, this is applied on both client and server.
    const constructHook = data && data.hook && data.hook.construct
    if (constructHook) {
      constructHook(this)
    }
  }

  setChildren (children?: Array<VNode>) {
    this.children = children
  }
}

export const emptyVNode = () => new VNode(undefined, undefined, undefined, '')
