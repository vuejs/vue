import { parse } from './parser/index'
import { generate } from './codegen/index'
import { directives } from './codegen/directives/index'

const cache1 = Object.create(null)
const cache2 = Object.create(null)

export function compile (html, options) {
  html = html.trim()
  options = options || {}
  const cache = options.preserveWhitespace ? cache1 : cache2
  const hit = cache[html]
  if (hit) {
    return hit
  } else {
    const ast = parse(html, options)
    return (cache[html] = generate(ast))
  }
}

export function registerDirective (name, fn) {
  directives[name] = fn
}
