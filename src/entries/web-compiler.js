/* @flow */

import { extend, genStaticKeys } from 'shared/util'
import { warn } from 'core/util/debug'
import { compile as baseCompile } from 'compiler/index'
import modules from 'web/compiler/modules/index'
import directives from 'web/compiler/directives/index'
import { isReservedTag, isUnaryTag, mustUseProp, getTagNamespace } from 'web/util/index'

// detect possible CSP restriction
/* istanbul ignore if */
if (process.env.NODE_ENV !== 'production') {
  try {
    new Function('return 1')
  } catch (e) {
    if (e.toString().match(/unsafe-eval|CSP/)) {
      warn(
        'It seems you are using the standalone build of Vue.js in an ' +
        'environment with Content Security Policy that prohibits unsafe-eval. ' +
        'The template compiler cannot work in this environment. Consider ' +
        'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
        'templates into render functions.'
      )
    }
  }
}

type CompiledFunctions = {
  render: Function,
  staticRenderFns: Array<Function>
}

const cache1: { [key: string]: CompiledFunctions } = Object.create(null)
const cache2: { [key: string]: CompiledFunctions } = Object.create(null)

export const baseOptions: CompilerOptions = {
  expectHTML: true,
  preserveWhitespace: true,
  modules,
  staticKeys: genStaticKeys(modules),
  directives,
  isReservedTag,
  isUnaryTag,
  mustUseProp,
  getTagNamespace
}

export function compile (
  template: string,
  options?: CompilerOptions
): { render: string, staticRenderFns: Array<string> } {
  options = options
    ? extend(extend({}, baseOptions), options)
    : baseOptions
  return baseCompile(template, options)
}

export function compileToFunctions (
  template: string,
  options?: CompilerOptions
): CompiledFunctions {
  const cache = options && options.preserveWhitespace === false ? cache1 : cache2
  const key = options && options.delimiters
    ? String(options.delimiters) + template
    : template
  if (cache[key]) {
    return cache[key]
  }
  const res = {}
  const compiled = compile(template, options)
  res.render = new Function(compiled.render)
  const l = compiled.staticRenderFns.length
  res.staticRenderFns = new Array(l)
  for (let i = 0; i < l; i++) {
    res.staticRenderFns[i] = new Function(compiled.staticRenderFns[i])
  }
  return (cache[key] = res)
}
