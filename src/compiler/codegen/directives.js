import { genModel } from './model'

const dirMap = {
  model: genModel
}

export function genDirectives (el) {
  const dirs = el.directives
  for (let i = 0; i < dirs.length; i++) {
    let dir = dirs[i]
    let gen = dirMap[dir.name]
    if (gen) {
      return gen(el, dir)
    }
  }
}
