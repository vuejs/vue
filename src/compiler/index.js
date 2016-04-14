import { parse } from './parser/index'
import { generate } from './codegen/index'
import { directives } from './codegen/directives/index'

const cache1 = Object.create(null)
const cache2 = Object.create(null)

export function compile (html, preserveWhitespace) {
  html = html.trim()
  const cache = preserveWhitespace ? cache1 : cache2
  const hit = cache[html]
  return hit || (cache[html] = generate(parse(html, preserveWhitespace)))
}

export function registerDirective (name, fn) {
  directives[name] = fn
}
