export function text (el, dir) {
  if (!dir.value) return
  if (!el.props) el.props = []
  el.props.push({
    name: 'textContent',
    value: `__toString__(${dir.value})`
  })
}
