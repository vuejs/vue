import VNode from 'core/vdom/vnode'

global.createTextVNode = function (text) {
  return new VNode(undefined, undefined, undefined, text)
}
