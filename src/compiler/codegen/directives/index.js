import { model } from './model'
import { show } from './show'
import { html } from './html'
import { ref } from './ref'
export { genHandlers } from './on'

export const directives = {
  model,
  show,
  html,
  ref,
  cloak: function () {} // noop
}

export function genDirectives (el) {
  const dirs = el.directives
  let res = 'directives:['
  let hasRuntime = false
  let i, l, dir
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i]
    let gen = directives[dir.name]
    if (gen) {
      // compile-time directive that manipulates AST
      gen(el, dir)
    } else {
      // runtime directive
      hasRuntime = true
      res += `{def:__d__("${dir.name}")${
        dir.value ? `,value:(${dir.value})` : ''
      }${
        dir.arg ? `,arg:"${dir.arg}"` : ''
      }${
        dir.modifiers ? `,modifiers:${JSON.stringify(dir.modifiers)}` : ''
      }},`
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']'
  }
}
