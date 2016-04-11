export default function VNode (sel, data, children, text, elm) {
  const key = data === undefined ? undefined : data.key
  return { sel, data, children, text, elm, key }
}
