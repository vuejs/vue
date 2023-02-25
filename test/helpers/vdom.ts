import VNode from 'core/vdom/vnode'

export function createTextVNode(text) {
  return new VNode(undefined, undefined, undefined, text)
}
