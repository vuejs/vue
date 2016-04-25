export default function show (node, dir) {
  if (!dir.value) {
    (node.data.style || (node.data.style = {})).display = 'none'
  }
}
