/* @flow */

import { extend } from 'shared/util'
import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { detectErrors } from './error-detector'
import { createCompileToFunctionFn } from './to-function'

function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options)
  optimize(ast, options)
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
}

export function createCompiler (baseOptions: CompilerOptions) {
  function compile (
    template: string,
    options?: CompilerOptions
  ): CompiledResult {
    const finalOptions = Object.create(baseOptions)
    const errors = []
    const tips = []
    finalOptions.warn = (msg, tip) => {
      (tip ? tips : errors).push(msg)
    }

    if (options) {
      // merge custom modules
      if (options.modules) {
        finalOptions.modules = (baseOptions.modules || []).concat(options.modules)
      }
      // merge custom directives
      if (options.directives) {
        finalOptions.directives = extend(
          Object.create(baseOptions.directives),
          options.directives
        )
      }
      // copy other options
      for (const key in options) {
        if (key !== 'modules' && key !== 'directives') {
          finalOptions[key] = options[key]
        }
      }
    }

    const compiled = baseCompile(template, finalOptions)
    if (process.env.NODE_ENV !== 'production') {
      errors.push.apply(errors, detectErrors(compiled.ast))
    }
    compiled.errors = errors
    compiled.tips = tips
    return compiled
  }

  return {
    compile,
    compileToFunctions: createCompileToFunctionFn(compile)
  }
}
