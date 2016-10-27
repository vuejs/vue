/* @flow */

import { extend } from 'shared/util'
import { compile as baseCompile, baseOptions } from 'web/compiler/index'
import { detectErrors } from 'compiler/error-detector'

export { parseComponent } from 'sfc/parser'
export { compileToFunctions } from 'web/compiler/index'

export function compile (
  template: string,
  options?: CompilerOptions
): CompiledResult {
  options = options || {}
  const errors = []
  // allow injecting modules/directives
  const baseModules = baseOptions.modules || []
  const modules = options.modules
    ? baseModules.concat(options.modules)
    : baseModules
  const directives = options.directives
    ? extend(extend({}, baseOptions.directives), options.directives)
    : baseOptions.directives
  const compiled = baseCompile(template, {
    modules,
    directives,
    preserveWhitespace: options.preserveWhitespace,
    warn: msg => {
      errors.push(msg)
    }
  })
  compiled.errors = errors.concat(detectErrors(compiled.ast))
  return compiled
}
