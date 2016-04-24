import { extend } from 'shared/util'
import { compile as baseCompile } from 'compiler/index'
import directives from 'web/compiler/directives/index'
import { isReservedTag, mustUseProp, getTagNamespace } from 'web/util/index'

const cache1 = Object.create(null)
const cache2 = Object.create(null)

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

export function compileToFunctions (template, options = {}) {
  const preserveWhitespace = options.preserveWhitespace !== false
  const cache = preserveWhitespace ? cache1 : cache2
  if (cache[template]) {
    return cache[template]
  }
  const res = {}
  const compiled = compile(template, { preserveWhitespace })
  res.render = new Function(compiled.render)
  const l = compiled.staticRenderFns.length
  if (l) {
    res.staticRenderFns = new Array(l)
    for (let i = 0; i < l; i++) {
      res.staticRenderFns[i] = new Function(compiled.staticRenderFns[i])
    }
  }
  return (cache[template] = res)
}
