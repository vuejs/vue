import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen'

/**
 * Compile a template.
 *
 * @param {String} template
 * @param {Object} options
 *                 - warn
 *                 - directives
 *                 - isReservedTag
 *                 - mustUseProp
 *                 - getTagNamespace
 */

export function compile (template, options) {
  const ast = parse(template.trim(), options)
  optimize(ast, options)
  return generate(ast, options)
}
