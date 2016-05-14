/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen'

/**
 * Compile a template.
 */
export function compile (
  template: string,
  options: CompilerOptions
): {
  render: string,
  staticRenderFns: Array<string>
} {
  const ast = parse(template.trim(), options)
  optimize(ast, options)
  return generate(ast, options)
}
