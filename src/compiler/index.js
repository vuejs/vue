import { parse } from './html-parser'
import { generate } from './codegen/index'

const cache1 = Object.create(null)
const cache2 = Object.create(null)

export function compile (html, preserveWhiteSpace) {
  html = html.trim()
  const cache = preserveWhiteSpace ? cache1 : cache2
  const hit = cache[html]
  return hit || (cache[html] = generate(parse(html, preserveWhiteSpace)))
}
