import MagicString from 'magic-string'
import { parseExpression, ParserOptions, ParserPlugin } from '@babel/parser'
import { makeMap } from 'shared/util'
import { walkIdentifiers } from './babelUtils'

const doNotPrefix = makeMap(
  'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require,' + // for webpack
    'arguments,' + // parsed as identifier but is a special keyword...
    '_c' // cached to save property access
)

/**
 * The input is expected to be the render function code directly returned from
 * `compile()` calls, e.g. `with(this){return ...}`
 */
export function stripWith(
  source: string,
  fnName = '',
  isFunctional = false,
  isTS = false,
  babelOptions: ParserOptions = {}
) {
  source = `function ${fnName}(${isFunctional ? `_c,_vm` : ``}){${source}\n}`

  const s = new MagicString(source)

  const plugins: ParserPlugin[] = [
    ...(isTS ? (['typescript'] as const) : []),
    ...(babelOptions?.plugins || [])
  ]

  const ast = parseExpression(source, {
    ...babelOptions,
    plugins
  })

  walkIdentifiers(
    ast,
    ident => {
      if (doNotPrefix(ident.name)) {
        return
      }
      s.prependRight(ident.start!, '_vm.')
    },
    node => {
      if (node.type === 'WithStatement') {
        s.remove(node.start!, node.body.start! + 1)
        s.remove(node.end! - 1, node.end!)
        if (!isFunctional) {
          s.prependRight(node.start!, `var _vm=this;var _c=_vm._self._c;`)
        }
      }
    }
  )

  return s.toString()
}
