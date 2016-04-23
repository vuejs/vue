import { parse } from './parser/index'
import { optimize } from './optimizer/index'
import { generate } from './codegen/index'
import { directives } from './codegen/directives/index'

export function compile (html, options) {
  const ast = parse(html.trim(), options)
  optimize(ast)
  return generate(ast)
}

export function registerDirective (name, fn) {
  directives[name] = fn
}
