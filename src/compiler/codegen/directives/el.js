export function ref (el, dir) {
  if (!el.hooks) el.hooks = {}
  const code = `$refs["${dir.arg}"]=vnode.elm || vnode.data.child`
  if (el.hooks.insert) {
    el.hooks.insert = el.hooks.insert
      .replace(/^function\(vnode\)\{(.*)\}$/, `function(vnode){$1;${code}}`)
  } else {
    el.hooks.insert = `function(vnode){${code}}`
  }
}
