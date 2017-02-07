/* @flow */

import { isUnaryTag } from './util'
import { warn } from 'core/util/debug'
import { detectErrors } from 'compiler/error-detector'
import { compile as baseCompile } from 'compiler/index'
import { extend, genStaticKeys, noop } from 'shared/util'
import { isReservedTag, mustUseProp, getTagNamespace, isPreTag } from '../util/index'

import modules from './modules/index'
import directives from './directives/index'

const cache: { [key: string]: CompiledFunctionResult } = Object.create(null)

export const baseOptions: CompilerOptions = {
  expectHTML: true,
  modules,
  staticKeys: genStaticKeys(modules),
  directives,
  isReservedTag,
  isUnaryTag,
  mustUseProp,
  getTagNamespace,
  isPreTag
}

function compileWithOptions (
  template: string,
  options?: CompilerOptions
): CompiledResult {
  options = options
    ? extend(extend({}, baseOptions), options)
    : baseOptions
  return baseCompile(template, options)
}

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
  const compiled = compileWithOptions(template, {
    modules,
    directives,
    preserveWhitespace: options.preserveWhitespace,
    warn: msg => {
      errors.push(msg)
    }
  })
  if (process.env.NODE_ENV !== 'production') {
    compiled.errors = errors.concat(detectErrors(compiled.ast))
  }
  return compiled
}

export function compileToFunctions (
  template: string,
  options?: CompilerOptions,
  vm?: Component
): CompiledFunctionResult {
  options = extend({}, options)
  const _warn = options.warn || warn
  const errors = []
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production') {
    options.warn = msg => {
      errors.push(msg)
    }

    // detect possible CSP restriction
    try {
      new Function('return 1')
    } catch (e) {
      if (e.toString().match(/unsafe-eval|CSP/)) {
        _warn(
          'It seems you are using the standalone build of Vue.js in an ' +
          'environment with Content Security Policy that prohibits unsafe-eval. ' +
          'The template compiler cannot work in this environment. Consider ' +
          'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
          'templates into render functions.'
        )
      }
    }
  }
  const key = options.delimiters
    ? String(options.delimiters) + template
    : template
  if (cache[key]) {
    return cache[key]
  }
  const res = {}
  const compiled = compileWithOptions(template, options)
  res.render = makeFunction(compiled.render)
  const l = compiled.staticRenderFns.length
  res.staticRenderFns = new Array(l)
  for (let i = 0; i < l; i++) {
    res.staticRenderFns[i] = makeFunction(compiled.staticRenderFns[i])
  }
  if (process.env.NODE_ENV !== 'production') {
    if (
      errors.length ||
      res.render === noop ||
      res.staticRenderFns.some(fn => fn === noop)
    ) {
      const expressionErrors = detectErrors(compiled.ast)
      _warn(
        `Error compiling template:\n\n${template}\n\n` +
        (errors.length ? errors.map(e => `- ${e}`).join('\n') + '\n' : '') +
        (expressionErrors.length ? expressionErrors.join('\n') + '\n' : ''),
        vm
      )
    }
  }
  return (cache[key] = res)
}

function makeFunction (code) {
  try {
    return new Function(code)
  } catch (e) {
    return noop
  }
}
