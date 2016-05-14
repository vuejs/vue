/* @flow */

import { extend } from 'shared/util'
import { compile as baseCompile } from 'compiler/index'
import directives from 'web/compiler/directives/index'
import { isReservedTag, isUnaryTag, mustUseProp, getTagNamespace } from 'web/util/index'

type CompiledFunctions = {
  render: Function,
  staticRenderFns: Array<Function>
}

const cache1: { [key: string]: CompiledFunctions } = Object.create(null)
const cache2: { [key: string]: CompiledFunctions } = Object.create(null)

const baseOptions: CompilerOptions = {
  expectHTML: true,
  preserveWhitespace: true,
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
  if (cache[template]) {
    return cache[template]
  }
  const res = {}
  const compiled = compile(template, options)
  res.render = new Function(compiled.render)
  const l = compiled.staticRenderFns.length
  res.staticRenderFns = new Array(l)
  for (let i = 0; i < l; i++) {
    res.staticRenderFns[i] = new Function(compiled.staticRenderFns[i])
  }
  return (cache[template] = res)
}
