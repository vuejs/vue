export function html (el, dir) {
  if (!dir.value) return
  if (!el.props) el.props = []
  el.props.push({
    name: 'innerHTML',
    value: `(${dir.value})`
  })
}
