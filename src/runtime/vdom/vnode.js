export default function VNode (tag, data, children, text, elm, ns) {
  return {
    tag,
    data,
    children,
    text,
    elm,
    ns,
    key: data && data.key
  }
}
