export function ref (el, dir) {
  if (!el.hooks) {
    el.hooks = {}
  }
  // go up and check if this node is inside a v-for
  let isFor = false
  let parent = el
  while (parent) {
    if (parent.for !== undefined) {
      isFor = true
    }
    parent = parent.parent
  }
  // register ref:
  // __r__(name, ref, vFor?, remove?)
  const code = `__r__("${dir.arg}", vnode.data.child || vnode.elm, ${isFor ? 'true' : 'false'}`
  patchHook(el.hooks, 'insert', `${code})`)
  patchHook(el.hooks, 'destroy', `${code}, true)`)
}

const replaceRE = /^function\(vnode\)\{(.*)\}$/
function patchHook (hooks, name, code) {
  if (hooks[name]) {
    hooks[name] = hooks[name].replace(replaceRE, `function(vnode){$1;${code}}`)
  } else {
    hooks[name] = `function(vnode){${code}}`
  }
}
