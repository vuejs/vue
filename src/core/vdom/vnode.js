/* @flow */

// 定义vnode类型
export default class VNode {
  // 前节点的标签名
  tag: string | void;
  // 当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息
  data: VNodeData | void;
  // 当前节点的子节点，是一个数组
  children: ?Array<VNode>;
  // 当前节点的文本
  text: string | void;
  // 当前虚拟节点对应的真实dom节点
  elm: Node | void;
  // 当前节点的名字空间
  ns: string | void;
  // 当前节点的编译作用域
  context: Component | void; // rendered in this component's scope
  // 节点的key属性，被当作节点的标志，用以优化
  key: string | number | void;
  // 组件的option选项
  componentOptions: VNodeComponentOptions | void;
  // 当前节点对应的组件的实例
  componentInstance: Component | void; // component instance
  // 当前节点的父节点
  parent: VNode | void; // component placeholder node

  // strictly internal
  // 简而言之就是是否为原生HTML或只是普通文本，innerHTML的时候为true，textContent的时候为false
  raw: boolean; // contains raw HTML? (server only)
  // 是否为静态节点
  isStatic: boolean; // hoisted static node
  // 是否作为跟节点插入
  isRootInsert: boolean; // necessary for enter transition check
  // 是否为注释节点
  isComment: boolean; // empty comment placeholder?
  // 是否为克隆节点
  isCloned: boolean; // is a cloned node?
  // 是否有v-once指令
  isOnce: boolean; // is a v-once node?
  asyncFactory: Function | void; // async component factory function
  asyncMeta: Object | void;
  isAsyncPlaceholder: boolean;
  ssrContext: Object | void;
  // 函数化组件作用域
  functionalContext: Component | void; // real context vm for functional nodes
  functionalOptions: ?ComponentOptions; // for SSR caching
  functionalScopeId: ?string; // functioanl scope id support

  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.functionalContext = undefined
    this.functionalOptions = undefined
    this.functionalScopeId = undefined
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isComment = false
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child (): Component | void {
    return this.componentInstance
  }
}

export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}

export function createTextVNode (val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
export function cloneVNode (vnode: VNode, deep?: boolean): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.isCloned = true
  if (deep && vnode.children) {
    cloned.children = cloneVNodes(vnode.children)
  }
  return cloned
}

export function cloneVNodes (vnodes: Array<VNode>, deep?: boolean): Array<VNode> {
  const len = vnodes.length
  const res = new Array(len)
  for (let i = 0; i < len; i++) {
    res[i] = cloneVNode(vnodes[i], deep)
  }
  return res
}
