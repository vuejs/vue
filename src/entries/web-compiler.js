import { compile as baseCompile } from 'web/compiler/index'
import { detectErrors } from 'compiler/error-detector'

export { parseSFC as parseComponent } from 'compiler/parser/sfc-parser'
export { compileToFunctions } from 'web/compiler/index'

export function compile (
  template: string,
  options?: Object
): CompiledResult {
  const errors = []
  const compiled = baseCompile(template, {
    warn: msg => {
      errors.push(msg)
    }
  })
  compiled.errors = errors.concat(detectErrors(compiled.ast))
  return compiled
}
