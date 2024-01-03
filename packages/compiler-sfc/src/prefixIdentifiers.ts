import MagicString from 'magic-string'
import { parseExpression, ParserOptions, ParserPlugin } from '@babel/parser'
import { makeMap } from 'shared/util'
import { isStaticProperty, walkIdentifiers } from './babelUtils'
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
 * The input is expected to be a valid expression.
 */
export function prefixIdentifiers(
  source: string,
  isFunctional = false,
  isTS = false,
  babelOptions: ParserOptions = {},
  bindings?: BindingMetadata
) {
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
    (ident, parent) => {
      const { name } = ident
      if (doNotPrefix(name)) {
        return
      }

      let prefix = `_vm.`
      if (isScriptSetup) {
        const type = bindings[name]
        if (type && type.startsWith('setup')) {
          prefix = `_setup.`
        }
      }

      if (isStaticProperty(parent) && parent.shorthand) {
        // property shorthand like { foo }, we need to add the key since
        // we rewrite the value
        // { foo } -> { foo: _vm.foo }
        s.appendLeft(ident.end!, `: ${prefix}${name}`)
      } else {
        s.prependRight(ident.start!, prefix)
      }
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
