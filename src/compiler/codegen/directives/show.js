export function show (el, dir) {
  patchNode(el, `display:(${dir.value}?'':'none')`)
  if (el.elseBlock) {
    patchNode(el.elseBlock, `display:(${dir.value}?'none':'')`)
  }
}

function patchNode (el, code) {
  el.styleBinding = el.styleBinding
    ? el.styleBinding.replace(/}\s?$/, `${code},}`)
    : `{${code}}`
}
