export default function VNode (tag, data, children, text, elm) {
  return {
    tag,
    data,
    children,
    text,
    elm,
    key: data && data.key
  }
}
