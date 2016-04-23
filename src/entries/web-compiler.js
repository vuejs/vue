import { extend } from 'shared/util'
import { compile as baseCompile } from 'compiler/index'
import directives from 'web/compiler/directives/index'
import { isReservedTag, mustUseProp, getTagNamespace } from 'web/util'

const baseOptions = {
  directives,
  isReservedTag,
  mustUseProp,
  getTagNamespace
}

export function compile (template, options) {
  options = options
    ? extend(extend({}, baseOptions), options)
    : baseOptions
  return baseCompile(template, options)
}
