export function show (el, dir) {
  let code = `display:(${dir.value}?'':'none')`
  el.styleBinding = el.styleBinding
    ? el.styleBinding.replace(/}\s?$/, `${code},}`)
    : `{${code}}`
}
