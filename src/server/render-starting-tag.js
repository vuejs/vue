export function renderStartingTag (node, modules, directives) {
  let markup = `<${node.tag}`
  if (node.data) {
    // check directives
    const dirs = node.data.directives
    if (dirs) {
      for (let i = 0; i < dirs.length; i++) {
        let dirRenderer = directives[dirs[i].name]
        if (dirRenderer) {
          // directives mutate the node's data
          // which then gets rendered by modules
          dirRenderer(node, dirs[i])
        }
      }
    }
    // apply other modules
    for (let i = 0; i < modules.length; i++) {
      let res = modules[i](node)
      if (res) {
        markup += res
      }
    }
  }
  return markup + '>'
}
