/* @flow */

// this will be preserved during build
// $flow-disable-line
const transpile = require('vue-template-es2015-compiler')

import { simplePathRE, fnExpRE } from 'compiler/codegen/events'
import { functionCallRE, generateBinding } from 'weex/util/parser'

// Generate handler code with binding params for Weex platform
/* istanbul ignore next */
export function genWeexHandlerWithParams (handlerCode: string): string {
  const match = functionCallRE.exec(handlerCode)
  if (!match) {
    return ''
  }
  const handlerExp = match[1]
  const params = match[2].split(/\s*,\s*/)
  const exps = params.filter(exp => simplePathRE.test(exp) && exp !== '$event')
  const bindings = exps.map(exp => generateBinding(exp))
  const args = exps.map((exp, index) => {
    const key = `$$_${index + 1}`
    for (let i = 0; i < params.length; ++i) {
      if (params[i] === exp) {
        params[i] = key
      }
    }
    return key
  })
  args.push('$event')
  return `{
    handler: function (${args.join(',')}) {
      ${handlerExp}(${params.join(',')});
    },
    params:${JSON.stringify(bindings)}
  }`
}

export function genWeexHandler (handler: ASTElementHandler, options: CompilerOptions): string {
  let code = handler.value
  const isMethodPath = simplePathRE.test(code)
  const isFunctionExpression = fnExpRE.test(code)
  const isFunctionCall = functionCallRE.test(code)

  // using dynamic this in recyclable event handlers
  if (options.recyclable) {
    if (isMethodPath) {
      return `function($event){this.${code}()}`
    }
    if (isFunctionExpression && options.warn) {
      options.warn(`Function expression is not supported in recyclable components: ${code}.`)
    }
    if (isFunctionCall) {
      return `function($event){this.${code}}`
    }
    // inline statement
    code = transpile(`with(this){${code}}`, {
      transforms: { stripWith: true }
    })
  }

  if (isMethodPath || isFunctionExpression) {
    return code
  }
  /* istanbul ignore if */
  if (handler.params) {
    return genWeexHandlerWithParams(handler.value)
  }
  // inline statement
  return `function($event){${code}}`
}
