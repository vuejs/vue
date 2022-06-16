import MagicString from 'magic-string'
import { parseExpression, ParserOptions, ParserPlugin } from '@babel/parser'
import { makeMap } from 'shared/util'
import { walkIdentifiers } from './babelUtils'
import { BindingMetadata } from './types'

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
export function prefixIdentifiers(
  source: string,
  fnName = '',
  isFunctional = false,
  isTS = false,
  babelOptions: ParserOptions = {},
  bindings?: BindingMetadata
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

  const isScriptSetup = bindings && bindings.__isScriptSetup !== false

  walkIdentifiers(
    ast,
    ident => {
      const { name } = ident
      if (doNotPrefix(name)) {
        return
      }

      if (!isScriptSetup) {
        s.prependRight(ident.start!, '_vm.')
        return
      }

      s.overwrite(ident.start!, ident.end!, rewriteIdentifier(name, bindings))
    },
    node => {
      if (node.type === 'WithStatement') {
        s.remove(node.start!, node.body.start! + 1)
        s.remove(node.end! - 1, node.end!)
        if (!isFunctional) {
          s.prependRight(
            node.start!,
            `var _vm=this,_c=_vm._self._c${
              isScriptSetup ? `,_setup=_vm._self._setupProxy;` : `;`
            }`
          )
        }
      }
    }
  )

  return s.toString()
}

export function rewriteIdentifier(
  name: string,
  bindings: BindingMetadata
): string {
  const type = bindings[name]
  if (type && type.startsWith('setup')) {
    return `_setup.${name}`
  } else {
    return `_vm.${name}`
  }
}
