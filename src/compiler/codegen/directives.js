import { genModel } from './model'

export const directives = {
  model: genModel
}

export function genDirectives (el) {
  const dirs = el.directives
  let res = 'directives:['
  let hasRuntime = false
  for (let i = 0; i < dirs.length; i++) {
    let dir = dirs[i]
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
        dir.modifiers ? `,modifiers:${JSON.stringify(dir.modifiers)}` : ''
      }},`
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']'
  }
}
