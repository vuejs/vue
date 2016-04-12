export default function VNode (sel, data, children, text, elm) {
  return { sel, data, children, text, elm, key: data && data.key }
}
