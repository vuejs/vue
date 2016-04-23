export default function VNode (tag, data, children, text, elm, namespace) {
  return {
    tag,
    data,
    children,
    text,
    elm,
    namespace,
    key: data && data.key
  }
}
