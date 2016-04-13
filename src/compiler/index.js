import { parse } from './template-parser'
import { generate } from './codegen/index'

const cache1 = Object.create(null)
const cache2 = Object.create(null)

export function compile (html, preserveWhitespace) {
  html = html.trim()
  const cache = preserveWhitespace ? cache1 : cache2
  const hit = cache[html]
  return hit || (cache[html] = generate(parse(html, preserveWhitespace)))
}
