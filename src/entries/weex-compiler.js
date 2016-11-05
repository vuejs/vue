/* @flow */

import { extend } from 'shared/util'
import { compile as baseCompile, baseOptions } from 'weex/compiler/index'
import { detectErrors } from 'compiler/error-detector'

export function compile (
  template: string,
  options?: CompilerOptions
): CompiledResult {
  options = options || {}
  const errors = []
  // allow injecting modules/directives
  const modules = options.modules
    ? baseOptions.modules.concat(options.modules)
    : baseOptions.modules
  const directives = options.directives
    ? extend(extend({}, baseOptions.directives), options.directives)
    : baseOptions.directives
  const compiled = baseCompile(template, {
    modules,
    directives,
    warn: msg => {
      errors.push(msg)
    }
  })
  compiled.errors = errors.concat(detectErrors(compiled.ast))
  return compiled
}
