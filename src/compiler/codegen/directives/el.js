export function el (el, dir) {
  if (!el.hooks) el.hooks = {}
  const code = `$els["${dir.arg}"]=vnode.elm`
  if (el.hooks.insert) {
    el.hooks.insert = el.hooks.insert
      .replace(/^function\(vnode\)\{(.*)\}$/, `function(vnode){$1;${code}}`)
  } else {
    el.hooks.insert = `function(vnode){${code}}`
  }
}
