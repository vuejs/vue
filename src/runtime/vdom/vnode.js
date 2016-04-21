export default function VNode (tag, data, children, text, elm, svg) {
  return {
    tag,
    data,
    children,
    text,
    elm,
    svg,
    key: data && data.key
  }
}
