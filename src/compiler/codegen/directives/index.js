import { model } from './model'
import { show } from './show'
import { text } from './text'
import { html } from './html'
import { ref } from './ref'
export { genHandlers } from './on'

export const directives = {
  model,
  show,
  text,
  html,
  ref,
  cloak: function () {} // noop
}

export function genDirectives (el) {
  const dirs = el.directives
  let res = 'directives:['
  let hasRuntime = false
  let i, l, dir, needRuntime
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i]
    needRuntime = true
    let gen = directives[dir.name]
    if (gen) {
      // compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
      needRuntime = !!gen(el, dir)
    }
    if (needRuntime) {
      hasRuntime = true
      res += `{def:__resolveDirective__("${dir.name}")${
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
