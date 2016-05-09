export default function VNode (tag, data, children, text, elm, ns, context) {
  return {
    tag,
    data,
    children,
    text,
    elm,
    ns,
    context,
    key: data && data.key
  }
}

export const emptyVNode = VNode(undefined, undefined, undefined, '')
