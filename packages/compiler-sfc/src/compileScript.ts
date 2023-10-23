import MagicString from 'magic-string'
import LRU from 'lru-cache'
import { walkIdentifiers, isFunctionType } from './babelUtils'
import { BindingMetadata, BindingTypes } from './types'
import { SFCDescriptor, SFCScriptBlock } from './parseComponent'
import {
  parse as _parse,
  parseExpression,
  ParserOptions,
  ParserPlugin
} from '@babel/parser'
import { generateCodeFrame } from 'compiler/codeframe'
import { camelize, capitalize, isBuiltInTag, makeMap } from 'shared/util'
import { parseHTML } from 'compiler/parser/html-parser'
import { baseOptions as webCompilerOptions } from 'web/compiler/options'
import {
  Node,
  Declaration,
  ObjectPattern,
  ObjectExpression,
  ArrayPattern,
  Identifier,
  ExportSpecifier,
  TSType,
  TSTypeLiteral,
  TSFunctionType,
  ObjectProperty,
  ArrayExpression,
  Statement,
  CallExpression,
  RestElement,
  TSInterfaceBody,
  Program,
  ObjectMethod,
  LVal,
  Expression
} from '@babel/types'
import { walk } from 'estree-walker'
import { RawSourceMap } from 'source-map'
import { warnOnce } from './warn'
import { isReservedTag } from 'web/util'
import { bindRE, dirRE, onRE, slotRE } from 'compiler/parser'
import { parseText } from 'compiler/parser/text-parser'
import { DEFAULT_FILENAME } from './parseComponent'
import {
  CSS_VARS_HELPER,
  genCssVarsCode,
  genNormalScriptCssVarsCode
} from './cssVars'
import { rewriteDefault } from './rewriteDefault'

// Special compiler macros
const DEFINE_PROPS = 'defineProps'
const DEFINE_EMITS = 'defineEmits'
const DEFINE_EXPOSE = 'defineExpose'
const WITH_DEFAULTS = 'withDefaults'

// constants
const DEFAULT_VAR = `__default__`

const isBuiltInDir = makeMap(
  `once,memo,if,for,else,else-if,slot,text,html,on,bind,model,show,cloak,is`
)

export interface SFCScriptCompileOptions {
  /**
   * Scope ID for prefixing injected CSS variables.
   * This must be consistent with the `id` passed to `compileStyle`.
   */
  id: string
  /**
   * Production mode. Used to determine whether to generate hashed CSS variables
   */
  isProd?: boolean
  /**
   * Enable/disable source map. Defaults to true.
   */
  sourceMap?: boolean
  /**
   * https://babeljs.io/docs/en/babel-parser#plugins
   */
  babelParserPlugins?: ParserPlugin[]
}

export interface ImportBinding {
  isType: boolean
  imported: string
  source: string
  isFromSetup: boolean
  isUsedInTemplate: boolean
}

/**
 * Compile `<script setup>`
 * It requires the whole SFC descriptor because we need to handle and merge
 * normal `<script>` + `<script setup>` if both are present.
 */
export function compileScript(
  sfc: SFCDescriptor,
  options: SFCScriptCompileOptions = { id: '' }
): SFCScriptBlock {
  let { filename, script, scriptSetup, source } = sfc
  const isProd = !!options.isProd
  const genSourceMap = options.sourceMap !== false
  let refBindings: string[] | undefined

  const cssVars = sfc.cssVars
  const scopeId = options.id ? options.id.replace(/^data-v-/, '') : ''
  const scriptLang = script && script.lang
  const scriptSetupLang = scriptSetup && scriptSetup.lang
  const isTS =
    scriptLang === 'ts' ||
    scriptLang === 'tsx' ||
    scriptSetupLang === 'ts' ||
    scriptSetupLang === 'tsx'

  // resolve parser plugins
  const plugins: ParserPlugin[] = []
  if (!isTS || scriptLang === 'tsx' || scriptSetupLang === 'tsx') {
    plugins.push('jsx')
  } else {
    // If don't match the case of adding jsx, should remove the jsx from the babelParserPlugins
    if (options.babelParserPlugins)
      options.babelParserPlugins = options.babelParserPlugins.filter(
        n => n !== 'jsx'
      )
  }
  if (options.babelParserPlugins) plugins.push(...options.babelParserPlugins)
  if (isTS) {
    plugins.push('typescript')
    if (!plugins.includes('decorators')) {
      plugins.push('decorators-legacy')
    }
  }

  if (!scriptSetup) {
    if (!script) {
      throw new Error(`[@vue/compiler-sfc] SFC contains no <script> tags.`)
    }
    if (scriptLang && !isTS && scriptLang !== 'jsx') {
      // do not process non js/ts script blocks
      return script
    }
    try {
      let content = script.content
      let map = script.map
      const scriptAst = _parse(content, {
        plugins,
        sourceType: 'module'
      }).program
      const bindings = analyzeScriptBindings(scriptAst.body)
      if (cssVars.length) {
        content = rewriteDefault(content, DEFAULT_VAR, plugins)
        content += genNormalScriptCssVarsCode(
          cssVars,
          bindings,
          scopeId,
          isProd
        )
        content += `\nexport default ${DEFAULT_VAR}`
      }
      return {
        ...script,
        content,
        map,
        bindings,
        scriptAst: scriptAst.body
      }
    } catch (e: any) {
      // silently fallback if parse fails since user may be using custom
      // babel syntax
      return script
    }
  }

  if (script && scriptLang !== scriptSetupLang) {
    throw new Error(
      `[@vue/compiler-sfc] <script> and <script setup> must have the same ` +
        `language type.`
    )
  }

  if (scriptSetupLang && !isTS && scriptSetupLang !== 'jsx') {
    // do not process non js/ts script blocks
    return scriptSetup
  }

  // metadata that needs to be returned
  const bindingMetadata: BindingMetadata = {}
  const helperImports: Set<string> = new Set()
  const userImports: Record<string, ImportBinding> = Object.create(null)
  const userImportAlias: Record<string, string> = Object.create(null)
  const scriptBindings: Record<string, BindingTypes> = Object.create(null)
  const setupBindings: Record<string, BindingTypes> = Object.create(null)

  let defaultExport: Node | undefined
  let hasDefinePropsCall = false
  let hasDefineEmitCall = false
  let hasDefineExposeCall = false
  let hasDefaultExportName = false
  let propsRuntimeDecl: Node | undefined
  let propsRuntimeDefaults: ObjectExpression | undefined
  let propsDestructureDecl: Node | undefined
  let propsDestructureRestId: string | undefined
  let propsTypeDecl: TSTypeLiteral | TSInterfaceBody | undefined
  let propsTypeDeclRaw: Node | undefined
  let propsIdentifier: string | undefined
  let emitsRuntimeDecl: Node | undefined
  let emitsTypeDecl:
    | TSFunctionType
    | TSTypeLiteral
    | TSInterfaceBody
    | undefined
  let emitsTypeDeclRaw: Node | undefined
  let emitIdentifier: string | undefined
  let hasInlinedSsrRenderFn = false
  // props/emits declared via types
  const typeDeclaredProps: Record<string, PropTypeData> = {}
  const typeDeclaredEmits: Set<string> = new Set()
  // record declared types for runtime props type generation
  const declaredTypes: Record<string, string[]> = {}
  // props destructure data
  const propsDestructuredBindings: Record<
    string, // public prop key
    {
      local: string // local identifier, may be different
      default?: Expression
    }
  > = Object.create(null)

  // magic-string state
  const s = new MagicString(source)
  const startOffset = scriptSetup.start
  const endOffset = scriptSetup.end
  const scriptStartOffset = script && script.start
  const scriptEndOffset = script && script.end

  function helper(key: string): string {
    helperImports.add(key)
    return `_${key}`
  }

  function parse(
    input: string,
    options: ParserOptions,
    offset: number
  ): Program {
    try {
      return _parse(input, options).program
    } catch (e: any) {
      e.message = `[@vue/compiler-sfc] ${
        e.message
      }\n\n${filename}\n${generateCodeFrame(
        source,
        e.pos + offset,
        e.pos + offset + 1
      )}`
      throw e
    }
  }

  function error(
    msg: string,
    node: Node,
    end: number = node.end! + startOffset
  ): never {
    throw new Error(
      `[@vue/compiler-sfc] ${msg}\n\n${filename}\n${generateCodeFrame(
        source,
        node.start! + startOffset,
        end
      )}`
    )
  }

  function registerUserImport(
    source: string,
    local: string,
    imported: string | false,
    isType: boolean,
    isFromSetup: boolean
  ) {
    if (source === 'vue' && imported) {
      userImportAlias[imported] = local
    }

    let isUsedInTemplate = true
    if (sfc.template && !sfc.template.src && !sfc.template.lang) {
      isUsedInTemplate = isImportUsed(local, sfc, isTS)
    }

    userImports[local] = {
      isType,
      imported: imported || 'default',
      source,
      isFromSetup,
      isUsedInTemplate
    }
  }

  function processDefineProps(node: Node, declId?: LVal): boolean {
    if (!isCallOf(node, DEFINE_PROPS)) {
      return false
    }

    if (hasDefinePropsCall) {
      error(`duplicate ${DEFINE_PROPS}() call`, node)
    }
    hasDefinePropsCall = true

    propsRuntimeDecl = node.arguments[0]

    // call has type parameters - infer runtime types from it
    if (node.typeParameters) {
      if (propsRuntimeDecl) {
        error(
          `${DEFINE_PROPS}() cannot accept both type and non-type arguments ` +
            `at the same time. Use one or the other.`,
          node
        )
      }

      propsTypeDeclRaw = node.typeParameters.params[0]
      propsTypeDecl = resolveQualifiedType(
        propsTypeDeclRaw,
        node => node.type === 'TSTypeLiteral'
      ) as TSTypeLiteral | TSInterfaceBody | undefined

      if (!propsTypeDecl) {
        error(
          `type argument passed to ${DEFINE_PROPS}() must be a literal type, ` +
            `or a reference to an interface or literal type.`,
          propsTypeDeclRaw
        )
      }
    }

    if (declId) {
      propsIdentifier = scriptSetup!.content.slice(declId.start!, declId.end!)
    }

    return true
  }

  function processWithDefaults(node: Node, declId?: LVal): boolean {
    if (!isCallOf(node, WITH_DEFAULTS)) {
      return false
    }
    if (processDefineProps(node.arguments[0], declId)) {
      if (propsRuntimeDecl) {
        error(
          `${WITH_DEFAULTS} can only be used with type-based ` +
            `${DEFINE_PROPS} declaration.`,
          node
        )
      }
      if (propsDestructureDecl) {
        error(
          `${WITH_DEFAULTS}() is unnecessary when using destructure with ${DEFINE_PROPS}().\n` +
            `Prefer using destructure default values, e.g. const { foo = 1 } = defineProps(...).`,
          node.callee
        )
      }
      propsRuntimeDefaults = node.arguments[1] as ObjectExpression
      if (
        !propsRuntimeDefaults ||
        propsRuntimeDefaults.type !== 'ObjectExpression'
      ) {
        error(
          `The 2nd argument of ${WITH_DEFAULTS} must be an object literal.`,
          propsRuntimeDefaults || node
        )
      }
    } else {
      error(
        `${WITH_DEFAULTS}' first argument must be a ${DEFINE_PROPS} call.`,
        node.arguments[0] || node
      )
    }
    return true
  }

  function processDefineEmits(node: Node, declId?: LVal): boolean {
    if (!isCallOf(node, DEFINE_EMITS)) {
      return false
    }
    if (hasDefineEmitCall) {
      error(`duplicate ${DEFINE_EMITS}() call`, node)
    }
    hasDefineEmitCall = true
    emitsRuntimeDecl = node.arguments[0]
    if (node.typeParameters) {
      if (emitsRuntimeDecl) {
        error(
          `${DEFINE_EMITS}() cannot accept both type and non-type arguments ` +
            `at the same time. Use one or the other.`,
          node
        )
      }

      emitsTypeDeclRaw = node.typeParameters.params[0]
      emitsTypeDecl = resolveQualifiedType(
        emitsTypeDeclRaw,
        node => node.type === 'TSFunctionType' || node.type === 'TSTypeLiteral'
      ) as TSFunctionType | TSTypeLiteral | TSInterfaceBody | undefined

      if (!emitsTypeDecl) {
        error(
          `type argument passed to ${DEFINE_EMITS}() must be a function type, ` +
            `a literal type with call signatures, or a reference to the above types.`,
          emitsTypeDeclRaw
        )
      }
    }

    if (declId) {
      emitIdentifier =
        declId.type === 'Identifier'
          ? declId.name
          : scriptSetup!.content.slice(declId.start!, declId.end!)
    }

    return true
  }

  function resolveQualifiedType(
    node: Node,
    qualifier: (node: Node) => boolean
  ) {
    if (qualifier(node)) {
      return node
    }
    if (
      node.type === 'TSTypeReference' &&
      node.typeName.type === 'Identifier'
    ) {
      const refName = node.typeName.name
      const isQualifiedType = (node: Node): Node | undefined => {
        if (
          node.type === 'TSInterfaceDeclaration' &&
          node.id.name === refName
        ) {
          return node.body
        } else if (
          node.type === 'TSTypeAliasDeclaration' &&
          node.id.name === refName &&
          qualifier(node.typeAnnotation)
        ) {
          return node.typeAnnotation
        } else if (node.type === 'ExportNamedDeclaration' && node.declaration) {
          return isQualifiedType(node.declaration)
        }
      }
      const body = scriptAst
        ? [...scriptSetupAst.body, ...scriptAst.body]
        : scriptSetupAst.body
      for (const node of body) {
        const qualified = isQualifiedType(node)
        if (qualified) {
          return qualified
        }
      }
    }
  }

  function processDefineExpose(node: Node): boolean {
    if (isCallOf(node, DEFINE_EXPOSE)) {
      if (hasDefineExposeCall) {
        error(`duplicate ${DEFINE_EXPOSE}() call`, node)
      }
      hasDefineExposeCall = true
      return true
    }
    return false
  }

  function checkInvalidScopeReference(node: Node | undefined, method: string) {
    if (!node) return
    walkIdentifiers(node, id => {
      if (setupBindings[id.name]) {
        error(
          `\`${method}()\` in <script setup> cannot reference locally ` +
            `declared variables because it will be hoisted outside of the ` +
            `setup() function. If your component options require initialization ` +
            `in the module scope, use a separate normal <script> to export ` +
            `the options instead.`,
          id
        )
      }
    })
  }

  /**
   * check defaults. If the default object is an object literal with only
   * static properties, we can directly generate more optimized default
   * declarations. Otherwise we will have to fallback to runtime merging.
   */
  function hasStaticWithDefaults() {
    return (
      propsRuntimeDefaults &&
      propsRuntimeDefaults.type === 'ObjectExpression' &&
      propsRuntimeDefaults.properties.every(
        node =>
          (node.type === 'ObjectProperty' && !node.computed) ||
          node.type === 'ObjectMethod'
      )
    )
  }

  function genRuntimeProps(props: Record<string, PropTypeData>) {
    const keys = Object.keys(props)
    if (!keys.length) {
      return ``
    }
    const hasStaticDefaults = hasStaticWithDefaults()
    const scriptSetupSource = scriptSetup!.content
    let propsDecls = `{
    ${keys
      .map(key => {
        let defaultString: string | undefined
        const destructured = genDestructuredDefaultValue(key)
        if (destructured) {
          defaultString = `default: ${destructured}`
        } else if (hasStaticDefaults) {
          const prop = propsRuntimeDefaults!.properties.find(
            (node: any) => node.key.name === key
          ) as ObjectProperty | ObjectMethod
          if (prop) {
            if (prop.type === 'ObjectProperty') {
              // prop has corresponding static default value
              defaultString = `default: ${scriptSetupSource.slice(
                prop.value.start!,
                prop.value.end!
              )}`
            } else {
              defaultString = `default() ${scriptSetupSource.slice(
                prop.body.start!,
                prop.body.end!
              )}`
            }
          }
        }

        const { type, required } = props[key]
        if (!isProd) {
          return `${key}: { type: ${toRuntimeTypeString(
            type
          )}, required: ${required}${
            defaultString ? `, ${defaultString}` : ``
          } }`
        } else if (
          type.some(
            el => el === 'Boolean' || (defaultString && el === 'Function')
          )
        ) {
          // #4783 production: if boolean or defaultString and function exists, should keep the type.
          return `${key}: { type: ${toRuntimeTypeString(type)}${
            defaultString ? `, ${defaultString}` : ``
          } }`
        } else {
          // production: checks are useless
          return `${key}: ${defaultString ? `{ ${defaultString} }` : 'null'}`
        }
      })
      .join(',\n    ')}\n  }`

    if (propsRuntimeDefaults && !hasStaticDefaults) {
      propsDecls = `${helper('mergeDefaults')}(${propsDecls}, ${source.slice(
        propsRuntimeDefaults.start! + startOffset,
        propsRuntimeDefaults.end! + startOffset
      )})`
    }

    return `\n  props: ${propsDecls},`
  }

  function genDestructuredDefaultValue(key: string): string | undefined {
    const destructured = propsDestructuredBindings[key]
    if (destructured && destructured.default) {
      const value = scriptSetup!.content.slice(
        destructured.default.start!,
        destructured.default.end!
      )
      const isLiteral = destructured.default.type.endsWith('Literal')
      return isLiteral ? value : `() => (${value})`
    }
  }

  function genSetupPropsType(node: TSTypeLiteral | TSInterfaceBody) {
    const scriptSetupSource = scriptSetup!.content
    if (hasStaticWithDefaults()) {
      // if withDefaults() is used, we need to remove the optional flags
      // on props that have default values
      let res = `{ `
      const members = node.type === 'TSTypeLiteral' ? node.members : node.body
      for (const m of members) {
        if (
          (m.type === 'TSPropertySignature' ||
            m.type === 'TSMethodSignature') &&
          m.typeAnnotation &&
          m.key.type === 'Identifier'
        ) {
          if (
            propsRuntimeDefaults!.properties.some(
              (p: any) => p.key.name === (m.key as Identifier).name
            )
          ) {
            res +=
              m.key.name +
              (m.type === 'TSMethodSignature' ? '()' : '') +
              scriptSetupSource.slice(
                m.typeAnnotation.start!,
                m.typeAnnotation.end!
              ) +
              ', '
          } else {
            res +=
              scriptSetupSource.slice(m.start!, m.typeAnnotation.end!) + `, `
          }
        }
      }
      return (res.length ? res.slice(0, -2) : res) + ` }`
    } else {
      return scriptSetupSource.slice(node.start!, node.end!)
    }
  }

  // 1. process normal <script> first if it exists
  let scriptAst: Program | undefined
  if (script) {
    scriptAst = parse(
      script.content,
      {
        plugins,
        sourceType: 'module'
      },
      scriptStartOffset!
    )

    for (const node of scriptAst.body) {
      if (node.type === 'ImportDeclaration') {
        // record imports for dedupe
        for (const specifier of node.specifiers) {
          const imported =
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.type === 'Identifier' &&
            specifier.imported.name
          registerUserImport(
            node.source.value,
            specifier.local.name,
            imported,
            node.importKind === 'type' ||
              (specifier.type === 'ImportSpecifier' &&
                specifier.importKind === 'type'),
            false
          )
        }
      } else if (node.type === 'ExportDefaultDeclaration') {
        // export default
        defaultExport = node

        // check if user has manually specified `name` or 'render` option in
        // export default
        // if has name, skip name inference
        // if has render and no template, generate return object instead of
        // empty render function (#4980)
        let optionProperties
        if (defaultExport.declaration.type === 'ObjectExpression') {
          optionProperties = defaultExport.declaration.properties
        } else if (
          defaultExport.declaration.type === 'CallExpression' &&
          defaultExport.declaration.arguments[0].type === 'ObjectExpression'
        ) {
          optionProperties = defaultExport.declaration.arguments[0].properties
        }
        if (optionProperties) {
          for (const s of optionProperties) {
            if (
              s.type === 'ObjectProperty' &&
              s.key.type === 'Identifier' &&
              s.key.name === 'name'
            ) {
              hasDefaultExportName = true
            }
          }
        }

        // export default { ... } --> const __default__ = { ... }
        const start = node.start! + scriptStartOffset!
        const end = node.declaration.start! + scriptStartOffset!
        s.overwrite(start, end, `const ${DEFAULT_VAR} = `)
      } else if (node.type === 'ExportNamedDeclaration') {
        const defaultSpecifier = node.specifiers.find(
          s => s.exported.type === 'Identifier' && s.exported.name === 'default'
        ) as ExportSpecifier
        if (defaultSpecifier) {
          defaultExport = node
          // 1. remove specifier
          if (node.specifiers.length > 1) {
            s.remove(
              defaultSpecifier.start! + scriptStartOffset!,
              defaultSpecifier.end! + scriptStartOffset!
            )
          } else {
            s.remove(
              node.start! + scriptStartOffset!,
              node.end! + scriptStartOffset!
            )
          }
          if (node.source) {
            // export { x as default } from './x'
            // rewrite to `import { x as __default__ } from './x'` and
            // add to top
            s.prepend(
              `import { ${defaultSpecifier.local.name} as ${DEFAULT_VAR} } from '${node.source.value}'\n`
            )
          } else {
            // export { x as default }
            // rewrite to `const __default__ = x` and move to end
            s.appendLeft(
              scriptEndOffset!,
              `\nconst ${DEFAULT_VAR} = ${defaultSpecifier.local.name}\n`
            )
          }
        }
        if (node.declaration) {
          walkDeclaration(node.declaration, scriptBindings, userImportAlias)
        }
      } else if (
        (node.type === 'VariableDeclaration' ||
          node.type === 'FunctionDeclaration' ||
          node.type === 'ClassDeclaration' ||
          node.type === 'TSEnumDeclaration') &&
        !node.declare
      ) {
        walkDeclaration(node, scriptBindings, userImportAlias)
      }
    }

    // apply reactivity transform
    // if (enableReactivityTransform && shouldTransform(script.content)) {
    //   const { rootRefs, importedHelpers } = transformAST(
    //     scriptAst,
    //     s,
    //     scriptStartOffset!
    //   )
    //   refBindings = rootRefs
    //   for (const h of importedHelpers) {
    //     helperImports.add(h)
    //   }
    // }

    // <script> after <script setup>
    // we need to move the block up so that `const __default__` is
    // declared before being used in the actual component definition
    if (scriptStartOffset! > startOffset) {
      // if content doesn't end with newline, add one
      if (!/\n$/.test(script.content.trim())) {
        s.appendLeft(scriptEndOffset!, `\n`)
      }
      s.move(scriptStartOffset!, scriptEndOffset!, 0)
    }
  }

  // 2. parse <script setup> and  walk over top level statements
  const scriptSetupAst = parse(
    scriptSetup.content,
    {
      plugins: [
        ...plugins,
        // allow top level await but only inside <script setup>
        'topLevelAwait'
      ],
      sourceType: 'module'
    },
    startOffset
  )

  for (const node of scriptSetupAst.body) {
    const start = node.start! + startOffset
    let end = node.end! + startOffset
    // locate comment
    if (node.trailingComments && node.trailingComments.length > 0) {
      const lastCommentNode =
        node.trailingComments[node.trailingComments.length - 1]
      end = lastCommentNode.end! + startOffset
    }
    // locate the end of whitespace between this statement and the next
    while (end <= source.length) {
      if (!/\s/.test(source.charAt(end))) {
        break
      }
      end++
    }

    // (Dropped) `ref: x` bindings
    if (
      node.type === 'LabeledStatement' &&
      node.label.name === 'ref' &&
      node.body.type === 'ExpressionStatement'
    ) {
      error(
        `ref sugar using the label syntax was an experimental proposal and ` +
          `has been dropped based on community feedback. Please check out ` +
          `the new proposal at https://github.com/vuejs/rfcs/discussions/369`,
        node
      )
    }

    if (node.type === 'ImportDeclaration') {
      // import declarations are moved to top
      s.move(start, end, 0)

      // dedupe imports
      let removed = 0
      const removeSpecifier = (i: number) => {
        const removeLeft = i > removed
        removed++
        const current = node.specifiers[i]
        const next = node.specifiers[i + 1]
        s.remove(
          removeLeft
            ? node.specifiers[i - 1].end! + startOffset
            : current.start! + startOffset,
          next && !removeLeft
            ? next.start! + startOffset
            : current.end! + startOffset
        )
      }

      for (let i = 0; i < node.specifiers.length; i++) {
        const specifier = node.specifiers[i]
        const local = specifier.local.name
        let imported =
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.type === 'Identifier' &&
          specifier.imported.name
        if (specifier.type === 'ImportNamespaceSpecifier') {
          imported = '*'
        }
        const source = node.source.value
        const existing = userImports[local]
        if (
          source === 'vue' &&
          (imported === DEFINE_PROPS ||
            imported === DEFINE_EMITS ||
            imported === DEFINE_EXPOSE)
        ) {
          warnOnce(
            `\`${imported}\` is a compiler macro and no longer needs to be imported.`
          )
          removeSpecifier(i)
        } else if (existing) {
          if (existing.source === source && existing.imported === imported) {
            // already imported in <script setup>, dedupe
            removeSpecifier(i)
          } else {
            error(`different imports aliased to same local name.`, specifier)
          }
        } else {
          registerUserImport(
            source,
            local,
            imported,
            node.importKind === 'type' ||
              (specifier.type === 'ImportSpecifier' &&
                specifier.importKind === 'type'),
            true
          )
        }
      }
      if (node.specifiers.length && removed === node.specifiers.length) {
        s.remove(node.start! + startOffset, node.end! + startOffset)
      }
    }

    if (node.type === 'ExpressionStatement') {
      // process `defineProps` and `defineEmit(s)` calls
      if (
        processDefineProps(node.expression) ||
        processDefineEmits(node.expression) ||
        processWithDefaults(node.expression)
      ) {
        s.remove(node.start! + startOffset, node.end! + startOffset)
      } else if (processDefineExpose(node.expression)) {
        // defineExpose({}) -> expose({})
        const callee = (node.expression as CallExpression).callee
        s.overwrite(
          callee.start! + startOffset,
          callee.end! + startOffset,
          'expose'
        )
      }
    }

    if (node.type === 'VariableDeclaration' && !node.declare) {
      const total = node.declarations.length
      let left = total
      for (let i = 0; i < total; i++) {
        const decl = node.declarations[i]
        if (decl.init) {
          // defineProps / defineEmits
          const isDefineProps =
            processDefineProps(decl.init, decl.id) ||
            processWithDefaults(decl.init, decl.id)
          const isDefineEmits = processDefineEmits(decl.init, decl.id)
          if (isDefineProps || isDefineEmits) {
            if (left === 1) {
              s.remove(node.start! + startOffset, node.end! + startOffset)
            } else {
              let start = decl.start! + startOffset
              let end = decl.end! + startOffset
              if (i === 0) {
                // first one, locate the start of the next
                end = node.declarations[i + 1].start! + startOffset
              } else {
                // not first one, locate the end of the prev
                start = node.declarations[i - 1].end! + startOffset
              }
              s.remove(start, end)
              left--
            }
          }
        }
      }
    }

    // walk declarations to record declared bindings
    if (
      (node.type === 'VariableDeclaration' ||
        node.type === 'FunctionDeclaration' ||
        node.type === 'ClassDeclaration') &&
      !node.declare
    ) {
      walkDeclaration(node, setupBindings, userImportAlias)
    }

    // walk statements & named exports / variable declarations for top level
    // await
    if (
      (node.type === 'VariableDeclaration' && !node.declare) ||
      node.type.endsWith('Statement')
    ) {
      const scope: Statement[][] = [scriptSetupAst.body]
      ;(walk as any)(node, {
        enter(child: Node, parent: Node) {
          if (isFunctionType(child)) {
            this.skip()
          }
          if (child.type === 'BlockStatement') {
            scope.push(child.body)
          }
          if (child.type === 'AwaitExpression') {
            error(
              `Vue 2 does not support top level await in <script setup>.`,
              child
            )
          }
        },
        exit(node: Node) {
          if (node.type === 'BlockStatement') scope.pop()
        }
      })
    }

    if (
      (node.type === 'ExportNamedDeclaration' && node.exportKind !== 'type') ||
      node.type === 'ExportAllDeclaration' ||
      node.type === 'ExportDefaultDeclaration'
    ) {
      error(
        `<script setup> cannot contain ES module exports. ` +
          `If you are using a previous version of <script setup>, please ` +
          `consult the updated RFC at https://github.com/vuejs/rfcs/pull/227.`,
        node
      )
    }

    if (isTS) {
      // runtime enum
      if (node.type === 'TSEnumDeclaration') {
        registerBinding(setupBindings, node.id, BindingTypes.SETUP_CONST)
      }

      // move all Type declarations to outer scope
      if (
        node.type.startsWith('TS') ||
        (node.type === 'ExportNamedDeclaration' &&
          node.exportKind === 'type') ||
        (node.type === 'VariableDeclaration' && node.declare)
      ) {
        recordType(node, declaredTypes)
        s.move(start, end, 0)
      }
    }
  }

  // 3. Apply reactivity transform
  // if (
  //   (enableReactivityTransform &&
  //     // normal <script> had ref bindings that maybe used in <script setup>
  //     (refBindings || shouldTransform(scriptSetup.content))) ||
  //   propsDestructureDecl
  // ) {
  //   const { rootRefs, importedHelpers } = transformAST(
  //     scriptSetupAst,
  //     s,
  //     startOffset,
  //     refBindings,
  //     propsDestructuredBindings
  //   )
  //   refBindings = refBindings ? [...refBindings, ...rootRefs] : rootRefs
  //   for (const h of importedHelpers) {
  //     helperImports.add(h)
  //   }
  // }

  // 4. extract runtime props/emits code from setup context type
  if (propsTypeDecl) {
    extractRuntimeProps(propsTypeDecl, typeDeclaredProps, declaredTypes, isProd)
  }
  if (emitsTypeDecl) {
    extractRuntimeEmits(emitsTypeDecl, typeDeclaredEmits)
  }

  // 5. check useOptions args to make sure it doesn't reference setup scope
  // variables
  checkInvalidScopeReference(propsRuntimeDecl, DEFINE_PROPS)
  checkInvalidScopeReference(propsRuntimeDefaults, DEFINE_PROPS)
  checkInvalidScopeReference(propsDestructureDecl, DEFINE_PROPS)
  checkInvalidScopeReference(emitsRuntimeDecl, DEFINE_EMITS)

  // 6. remove non-script content
  if (script) {
    if (startOffset < scriptStartOffset!) {
      // <script setup> before <script>
      s.remove(0, startOffset)
      s.remove(endOffset, scriptStartOffset!)
      s.remove(scriptEndOffset!, source.length)
    } else {
      // <script> before <script setup>
      s.remove(0, scriptStartOffset!)
      s.remove(scriptEndOffset!, startOffset)
      s.remove(endOffset, source.length)
    }
  } else {
    // only <script setup>
    s.remove(0, startOffset)
    s.remove(endOffset, source.length)
  }

  // 7. analyze binding metadata
  if (scriptAst) {
    Object.assign(bindingMetadata, analyzeScriptBindings(scriptAst.body))
  }
  if (propsRuntimeDecl) {
    for (const key of getObjectOrArrayExpressionKeys(propsRuntimeDecl)) {
      bindingMetadata[key] = BindingTypes.PROPS
    }
  }
  for (const key in typeDeclaredProps) {
    bindingMetadata[key] = BindingTypes.PROPS
  }
  // props aliases
  // if (propsDestructureDecl) {
  //   if (propsDestructureRestId) {
  //     bindingMetadata[propsDestructureRestId] =
  //       BindingTypes.SETUP_REACTIVE_CONST
  //   }
  //   for (const key in propsDestructuredBindings) {
  //     const { local } = propsDestructuredBindings[key]
  //     if (local !== key) {
  //       bindingMetadata[local] = BindingTypes.PROPS_ALIASED
  //       ;(bindingMetadata.__propsAliases ||
  //         (bindingMetadata.__propsAliases = {}))[local] = key
  //     }
  //   }
  // }
  for (const [key, { isType, imported, source }] of Object.entries(
    userImports
  )) {
    if (isType) continue
    bindingMetadata[key] =
      imported === '*' ||
      (imported === 'default' && source.endsWith('.vue')) ||
      source === 'vue'
        ? BindingTypes.SETUP_CONST
        : BindingTypes.SETUP_MAYBE_REF
  }
  for (const key in scriptBindings) {
    bindingMetadata[key] = scriptBindings[key]
  }
  for (const key in setupBindings) {
    bindingMetadata[key] = setupBindings[key]
  }
  // known ref bindings
  if (refBindings) {
    for (const key of refBindings) {
      bindingMetadata[key] = BindingTypes.SETUP_REF
    }
  }

  // 8. inject `useCssVars` calls
  if (cssVars.length) {
    helperImports.add(CSS_VARS_HELPER)
    s.prependRight(
      startOffset,
      `\n${genCssVarsCode(cssVars, bindingMetadata, scopeId, isProd)}\n`
    )
  }

  // 9. finalize setup() argument signature
  let args = `__props`
  if (propsTypeDecl) {
    // mark as any and only cast on assignment
    // since the user defined complex types may be incompatible with the
    // inferred type from generated runtime declarations
    args += `: any`
  }
  // inject user assignment of props
  // we use a default __props so that template expressions referencing props
  // can use it directly
  if (propsIdentifier) {
    s.prependLeft(
      startOffset,
      `\nconst ${propsIdentifier} = __props${
        propsTypeDecl ? ` as ${genSetupPropsType(propsTypeDecl)}` : ``
      };\n`
    )
  }
  if (propsDestructureRestId) {
    s.prependLeft(
      startOffset,
      `\nconst ${propsDestructureRestId} = ${helper(
        `createPropsRestProxy`
      )}(__props, ${JSON.stringify(Object.keys(propsDestructuredBindings))});\n`
    )
  }

  const destructureElements = hasDefineExposeCall ? [`expose`] : []
  if (emitIdentifier) {
    destructureElements.push(
      emitIdentifier === `emit` ? `emit` : `emit: ${emitIdentifier}`
    )
  }
  if (destructureElements.length) {
    args += `, { ${destructureElements.join(', ')} }`
    if (emitsTypeDecl) {
      args += `: { emit: (${scriptSetup.content.slice(
        emitsTypeDecl.start!,
        emitsTypeDecl.end!
      )}), expose: any, slots: any, attrs: any }`
    }
  }

  // 10. generate return statement
  const allBindings: Record<string, any> = {
    ...scriptBindings,
    ...setupBindings
  }
  for (const key in userImports) {
    if (!userImports[key].isType && userImports[key].isUsedInTemplate) {
      allBindings[key] = true
    }
  }
  // __sfc marker indicates these bindings are compiled from <script setup>
  // and should not be proxied on `this`
  const returned = `{ ${__TEST__ ? `` : `__sfc: true,`}${Object.keys(
    allBindings
  ).join(', ')} }`

  s.appendRight(endOffset, `\nreturn ${returned}\n}\n\n`)

  // 11. finalize default export
  let runtimeOptions = ``
  if (!hasDefaultExportName && filename && filename !== DEFAULT_FILENAME) {
    const match = filename.match(/([^/\\]+)\.\w+$/)
    if (match) {
      runtimeOptions += `\n  __name: '${match[1]}',`
    }
  }
  if (hasInlinedSsrRenderFn) {
    runtimeOptions += `\n  __ssrInlineRender: true,`
  }
  if (propsRuntimeDecl) {
    let declCode = scriptSetup.content
      .slice(propsRuntimeDecl.start!, propsRuntimeDecl.end!)
      .trim()
    if (propsDestructureDecl) {
      const defaults: string[] = []
      for (const key in propsDestructuredBindings) {
        const d = genDestructuredDefaultValue(key)
        if (d) defaults.push(`${key}: ${d}`)
      }
      if (defaults.length) {
        declCode = `${helper(
          `mergeDefaults`
        )}(${declCode}, {\n  ${defaults.join(',\n  ')}\n})`
      }
    }
    runtimeOptions += `\n  props: ${declCode},`
  } else if (propsTypeDecl) {
    runtimeOptions += genRuntimeProps(typeDeclaredProps)
  }
  if (emitsRuntimeDecl) {
    runtimeOptions += `\n  emits: ${scriptSetup.content
      .slice(emitsRuntimeDecl.start!, emitsRuntimeDecl.end!)
      .trim()},`
  } else if (emitsTypeDecl) {
    runtimeOptions += genRuntimeEmits(typeDeclaredEmits)
  }

  // wrap setup code with function.
  if (isTS) {
    // for TS, make sure the exported type is still valid type with
    // correct props information
    // we have to use object spread for types to be merged properly
    // user's TS setting should compile it down to proper targets
    // export default defineComponent({ ...__default__, ... })
    const def = defaultExport ? `\n  ...${DEFAULT_VAR},` : ``
    s.prependLeft(
      startOffset,
      `\nexport default /*#__PURE__*/${helper(
        `defineComponent`
      )}({${def}${runtimeOptions}\n  setup(${args}) {\n`
    )
    s.appendRight(endOffset, `})`)
  } else {
    if (defaultExport) {
      // without TS, can't rely on rest spread, so we use Object.assign
      // export default Object.assign(__default__, { ... })
      s.prependLeft(
        startOffset,
        `\nexport default /*#__PURE__*/Object.assign(${DEFAULT_VAR}, {${runtimeOptions}\n  ` +
          `setup(${args}) {\n`
      )
      s.appendRight(endOffset, `})`)
    } else {
      s.prependLeft(
        startOffset,
        `\nexport default {${runtimeOptions}\n  setup(${args}) {\n`
      )
      s.appendRight(endOffset, `}`)
    }
  }

  // 12. finalize Vue helper imports
  if (helperImports.size > 0) {
    s.prepend(
      `import { ${[...helperImports]
        .map(h => `${h} as _${h}`)
        .join(', ')} } from 'vue'\n`
    )
  }

  s.trim()

  return {
    ...scriptSetup,
    bindings: bindingMetadata,
    imports: userImports,
    content: s.toString(),
    map: genSourceMap
      ? (s.generateMap({
          source: filename,
          hires: true,
          includeContent: true
        }) as unknown as RawSourceMap)
      : undefined,
    scriptAst: scriptAst?.body,
    scriptSetupAst: scriptSetupAst?.body
  }
}

function registerBinding(
  bindings: Record<string, BindingTypes>,
  node: Identifier,
  type: BindingTypes
) {
  bindings[node.name] = type
}

function walkDeclaration(
  node: Declaration,
  bindings: Record<string, BindingTypes>,
  userImportAlias: Record<string, string>
) {
  if (node.type === 'VariableDeclaration') {
    const isConst = node.kind === 'const'
    // export const foo = ...
    for (const { id, init } of node.declarations) {
      const isDefineCall = !!(
        isConst &&
        isCallOf(
          init,
          c => c === DEFINE_PROPS || c === DEFINE_EMITS || c === WITH_DEFAULTS
        )
      )
      if (id.type === 'Identifier') {
        let bindingType
        const userReactiveBinding = userImportAlias['reactive'] || 'reactive'
        if (isCallOf(init, userReactiveBinding)) {
          // treat reactive() calls as let since it's meant to be mutable
          bindingType = isConst
            ? BindingTypes.SETUP_REACTIVE_CONST
            : BindingTypes.SETUP_LET
        } else if (
          // if a declaration is a const literal, we can mark it so that
          // the generated render fn code doesn't need to unref() it
          isDefineCall ||
          (isConst && canNeverBeRef(init!, userReactiveBinding))
        ) {
          bindingType = isCallOf(init, DEFINE_PROPS)
            ? BindingTypes.SETUP_REACTIVE_CONST
            : BindingTypes.SETUP_CONST
        } else if (isConst) {
          if (isCallOf(init, userImportAlias['ref'] || 'ref')) {
            bindingType = BindingTypes.SETUP_REF
          } else {
            bindingType = BindingTypes.SETUP_MAYBE_REF
          }
        } else {
          bindingType = BindingTypes.SETUP_LET
        }
        registerBinding(bindings, id, bindingType)
      } else {
        if (isCallOf(init, DEFINE_PROPS)) {
          // skip walking props destructure
          return
        }
        if (id.type === 'ObjectPattern') {
          walkObjectPattern(id, bindings, isConst, isDefineCall)
        } else if (id.type === 'ArrayPattern') {
          walkArrayPattern(id, bindings, isConst, isDefineCall)
        }
      }
    }
  } else if (
    node.type === 'TSEnumDeclaration' ||
    node.type === 'FunctionDeclaration' ||
    node.type === 'ClassDeclaration'
  ) {
    // export function foo() {} / export class Foo {}
    // export declarations must be named.
    bindings[node.id!.name] = BindingTypes.SETUP_CONST
  }
}

function walkObjectPattern(
  node: ObjectPattern,
  bindings: Record<string, BindingTypes>,
  isConst: boolean,
  isDefineCall = false
) {
  for (const p of node.properties) {
    if (p.type === 'ObjectProperty') {
      if (p.key.type === 'Identifier' && p.key === p.value) {
        // shorthand: const { x } = ...
        const type = isDefineCall
          ? BindingTypes.SETUP_CONST
          : isConst
          ? BindingTypes.SETUP_MAYBE_REF
          : BindingTypes.SETUP_LET
        registerBinding(bindings, p.key, type)
      } else {
        walkPattern(p.value, bindings, isConst, isDefineCall)
      }
    } else {
      // ...rest
      // argument can only be identifier when destructuring
      const type = isConst ? BindingTypes.SETUP_CONST : BindingTypes.SETUP_LET
      registerBinding(bindings, p.argument as Identifier, type)
    }
  }
}

function walkArrayPattern(
  node: ArrayPattern,
  bindings: Record<string, BindingTypes>,
  isConst: boolean,
  isDefineCall = false
) {
  for (const e of node.elements) {
    e && walkPattern(e, bindings, isConst, isDefineCall)
  }
}

function walkPattern(
  node: Node,
  bindings: Record<string, BindingTypes>,
  isConst: boolean,
  isDefineCall = false
) {
  if (node.type === 'Identifier') {
    const type = isDefineCall
      ? BindingTypes.SETUP_CONST
      : isConst
      ? BindingTypes.SETUP_MAYBE_REF
      : BindingTypes.SETUP_LET
    registerBinding(bindings, node, type)
  } else if (node.type === 'RestElement') {
    // argument can only be identifier when destructuring
    const type = isConst ? BindingTypes.SETUP_CONST : BindingTypes.SETUP_LET
    registerBinding(bindings, node.argument as Identifier, type)
  } else if (node.type === 'ObjectPattern') {
    walkObjectPattern(node, bindings, isConst)
  } else if (node.type === 'ArrayPattern') {
    walkArrayPattern(node, bindings, isConst)
  } else if (node.type === 'AssignmentPattern') {
    if (node.left.type === 'Identifier') {
      const type = isDefineCall
        ? BindingTypes.SETUP_CONST
        : isConst
        ? BindingTypes.SETUP_MAYBE_REF
        : BindingTypes.SETUP_LET
      registerBinding(bindings, node.left, type)
    } else {
      walkPattern(node.left, bindings, isConst)
    }
  }
}

interface PropTypeData {
  key: string
  type: string[]
  required: boolean
}

function recordType(node: Node, declaredTypes: Record<string, string[]>) {
  if (node.type === 'TSInterfaceDeclaration') {
    declaredTypes[node.id.name] = [`Object`]
  } else if (node.type === 'TSTypeAliasDeclaration') {
    declaredTypes[node.id.name] = inferRuntimeType(
      node.typeAnnotation,
      declaredTypes
    )
  } else if (node.type === 'ExportNamedDeclaration' && node.declaration) {
    recordType(node.declaration, declaredTypes)
  }
}

function extractRuntimeProps(
  node: TSTypeLiteral | TSInterfaceBody,
  props: Record<string, PropTypeData>,
  declaredTypes: Record<string, string[]>,
  isProd: boolean
) {
  const members = node.type === 'TSTypeLiteral' ? node.members : node.body
  for (const m of members) {
    if (
      (m.type === 'TSPropertySignature' || m.type === 'TSMethodSignature') &&
      m.key.type === 'Identifier'
    ) {
      let type
      if (m.type === 'TSMethodSignature') {
        type = ['Function']
      } else if (m.typeAnnotation) {
        type = inferRuntimeType(m.typeAnnotation.typeAnnotation, declaredTypes)
      }
      props[m.key.name] = {
        key: m.key.name,
        required: !m.optional,
        type: type || [`null`]
      }
    }
  }
}

function inferRuntimeType(
  node: TSType,
  declaredTypes: Record<string, string[]>
): string[] {
  switch (node.type) {
    case 'TSStringKeyword':
      return ['String']
    case 'TSNumberKeyword':
      return ['Number']
    case 'TSBooleanKeyword':
      return ['Boolean']
    case 'TSObjectKeyword':
      return ['Object']
    case 'TSTypeLiteral':
      // TODO (nice to have) generate runtime property validation
      return ['Object']
    case 'TSFunctionType':
      return ['Function']
    case 'TSArrayType':
    case 'TSTupleType':
      // TODO (nice to have) generate runtime element type/length checks
      return ['Array']

    case 'TSLiteralType':
      switch (node.literal.type) {
        case 'StringLiteral':
          return ['String']
        case 'BooleanLiteral':
          return ['Boolean']
        case 'NumericLiteral':
        case 'BigIntLiteral':
          return ['Number']
        default:
          return [`null`]
      }

    case 'TSTypeReference':
      if (node.typeName.type === 'Identifier') {
        if (declaredTypes[node.typeName.name]) {
          return declaredTypes[node.typeName.name]
        }
        switch (node.typeName.name) {
          case 'Array':
          case 'Function':
          case 'Object':
          case 'Set':
          case 'Map':
          case 'WeakSet':
          case 'WeakMap':
          case 'Date':
          case 'Promise':
            return [node.typeName.name]
          case 'Record':
          case 'Partial':
          case 'Readonly':
          case 'Pick':
          case 'Omit':
          case 'Exclude':
          case 'Extract':
          case 'Required':
          case 'InstanceType':
            return ['Object']
        }
      }
      return [`null`]

    case 'TSParenthesizedType':
      return inferRuntimeType(node.typeAnnotation, declaredTypes)
    case 'TSUnionType':
      return [
        ...new Set(
          [].concat(
            ...(node.types.map(t => inferRuntimeType(t, declaredTypes)) as any)
          )
        )
      ]
    case 'TSIntersectionType':
      return ['Object']

    case 'TSSymbolKeyword':
      return ['Symbol']

    default:
      return [`null`] // no runtime check
  }
}

function toRuntimeTypeString(types: string[]) {
  return types.length > 1 ? `[${types.join(', ')}]` : types[0]
}

function extractRuntimeEmits(
  node: TSFunctionType | TSTypeLiteral | TSInterfaceBody,
  emits: Set<string>
) {
  if (node.type === 'TSTypeLiteral' || node.type === 'TSInterfaceBody') {
    const members = node.type === 'TSTypeLiteral' ? node.members : node.body
    for (let t of members) {
      if (t.type === 'TSCallSignatureDeclaration') {
        extractEventNames(t.parameters[0], emits)
      }
    }
    return
  } else {
    extractEventNames(node.parameters[0], emits)
  }
}

function extractEventNames(
  eventName: Identifier | RestElement,
  emits: Set<string>
) {
  if (
    eventName.type === 'Identifier' &&
    eventName.typeAnnotation &&
    eventName.typeAnnotation.type === 'TSTypeAnnotation'
  ) {
    const typeNode = eventName.typeAnnotation.typeAnnotation
    if (typeNode.type === 'TSLiteralType') {
      if (
        typeNode.literal.type !== 'UnaryExpression' &&
        typeNode.literal.type !== 'TemplateLiteral'
      ) {
        emits.add(String(typeNode.literal.value))
      }
    } else if (typeNode.type === 'TSUnionType') {
      for (const t of typeNode.types) {
        if (
          t.type === 'TSLiteralType' &&
          t.literal.type !== 'UnaryExpression' &&
          t.literal.type !== 'TemplateLiteral'
        ) {
          emits.add(String(t.literal.value))
        }
      }
    }
  }
}

function genRuntimeEmits(emits: Set<string>) {
  return emits.size
    ? `\n  emits: [${Array.from(emits)
        .map(p => JSON.stringify(p))
        .join(', ')}],`
    : ``
}

function isCallOf(
  node: Node | null | undefined,
  test: string | ((id: string) => boolean)
): node is CallExpression {
  return !!(
    node &&
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    (typeof test === 'string'
      ? node.callee.name === test
      : test(node.callee.name))
  )
}

function canNeverBeRef(node: Node, userReactiveImport: string): boolean {
  if (isCallOf(node, userReactiveImport)) {
    return true
  }
  switch (node.type) {
    case 'UnaryExpression':
    case 'BinaryExpression':
    case 'ArrayExpression':
    case 'ObjectExpression':
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
    case 'UpdateExpression':
    case 'ClassExpression':
    case 'TaggedTemplateExpression':
      return true
    case 'SequenceExpression':
      return canNeverBeRef(
        node.expressions[node.expressions.length - 1],
        userReactiveImport
      )
    default:
      if (node.type.endsWith('Literal')) {
        return true
      }
      return false
  }
}

/**
 * Analyze bindings in normal `<script>`
 * Note that `compileScriptSetup` already analyzes bindings as part of its
 * compilation process so this should only be used on single `<script>` SFCs.
 */
function analyzeScriptBindings(ast: Statement[]): BindingMetadata {
  for (const node of ast) {
    if (
      node.type === 'ExportDefaultDeclaration' &&
      node.declaration.type === 'ObjectExpression'
    ) {
      return analyzeBindingsFromOptions(node.declaration)
    }
  }
  return {}
}

function analyzeBindingsFromOptions(node: ObjectExpression): BindingMetadata {
  const bindings: BindingMetadata = {}
  // #3270, #3275
  // mark non-script-setup so we don't resolve components/directives from these
  Object.defineProperty(bindings, '__isScriptSetup', {
    enumerable: false,
    value: false
  })
  for (const property of node.properties) {
    if (
      property.type === 'ObjectProperty' &&
      !property.computed &&
      property.key.type === 'Identifier'
    ) {
      // props
      if (property.key.name === 'props') {
        // props: ['foo']
        // props: { foo: ... }
        for (const key of getObjectOrArrayExpressionKeys(property.value)) {
          bindings[key] = BindingTypes.PROPS
        }
      }

      // inject
      else if (property.key.name === 'inject') {
        // inject: ['foo']
        // inject: { foo: {} }
        for (const key of getObjectOrArrayExpressionKeys(property.value)) {
          bindings[key] = BindingTypes.OPTIONS
        }
      }

      // computed & methods
      else if (
        property.value.type === 'ObjectExpression' &&
        (property.key.name === 'computed' || property.key.name === 'methods')
      ) {
        // methods: { foo() {} }
        // computed: { foo() {} }
        for (const key of getObjectExpressionKeys(property.value)) {
          bindings[key] = BindingTypes.OPTIONS
        }
      }
    }

    // setup & data
    else if (
      property.type === 'ObjectMethod' &&
      property.key.type === 'Identifier' &&
      (property.key.name === 'setup' || property.key.name === 'data')
    ) {
      for (const bodyItem of property.body.body) {
        // setup() {
        //   return {
        //     foo: null
        //   }
        // }
        if (
          bodyItem.type === 'ReturnStatement' &&
          bodyItem.argument &&
          bodyItem.argument.type === 'ObjectExpression'
        ) {
          for (const key of getObjectExpressionKeys(bodyItem.argument)) {
            bindings[key] =
              property.key.name === 'setup'
                ? BindingTypes.SETUP_MAYBE_REF
                : BindingTypes.DATA
          }
        }
      }
    }
  }

  return bindings
}

function getObjectExpressionKeys(node: ObjectExpression): string[] {
  const keys: string[] = []
  for (const prop of node.properties) {
    if (
      (prop.type === 'ObjectProperty' || prop.type === 'ObjectMethod') &&
      !prop.computed
    ) {
      if (prop.key.type === 'Identifier') {
        keys.push(prop.key.name)
      } else if (prop.key.type === 'StringLiteral') {
        keys.push(prop.key.value)
      }
    }
  }
  return keys
}

function getArrayExpressionKeys(node: ArrayExpression): string[] {
  const keys: string[] = []
  for (const element of node.elements) {
    if (element && element.type === 'StringLiteral') {
      keys.push(element.value)
    }
  }
  return keys
}

function getObjectOrArrayExpressionKeys(value: Node): string[] {
  if (value.type === 'ArrayExpression') {
    return getArrayExpressionKeys(value)
  }
  if (value.type === 'ObjectExpression') {
    return getObjectExpressionKeys(value)
  }
  return []
}

const templateUsageCheckCache = new LRU<string, string>(512)

function resolveTemplateUsageCheckString(sfc: SFCDescriptor, isTS: boolean) {
  const { content } = sfc.template!
  const cached = templateUsageCheckCache.get(content)
  if (cached) {
    return cached
  }

  let code = ''

  parseHTML(content, {
    ...webCompilerOptions,
    start(tag, attrs) {
      if (!isBuiltInTag(tag) && !isReservedTag(tag)) {
        code += `,${camelize(tag)},${capitalize(camelize(tag))}`
      }
      for (let i = 0; i < attrs.length; i++) {
        const { name, value } = attrs[i]
        if (dirRE.test(name)) {
          const baseName = onRE.test(name)
            ? 'on'
            : slotRE.test(name)
            ? 'slot'
            : bindRE.test(name)
            ? 'bind'
            : name.replace(dirRE, '')
          if (!isBuiltInDir(baseName)) {
            code += `,v${capitalize(camelize(baseName))}`
          }
          if (value) {
            code += `,${processExp(value, isTS, baseName)}`
          }
        }
      }
    },
    chars(text) {
      const res = parseText(text)
      if (res) {
        code += `,${processExp(res.expression, isTS)}`
      }
    }
  })

  code += ';'
  templateUsageCheckCache.set(content, code)
  return code
}

const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/

function processExp(exp: string, isTS: boolean, dir?: string): string {
  if (isTS && / as\s+\w|<.*>|:/.test(exp)) {
    if (dir === 'slot') {
      exp = `(${exp})=>{}`
    } else if (dir === 'on') {
      exp = `()=>{return ${exp}}`
    } else if (dir === 'for') {
      const inMatch = exp.match(forAliasRE)
      if (inMatch) {
        const [, LHS, RHS] = inMatch
        return processExp(`(${LHS})=>{}`, true) + processExp(RHS, true)
      }
    }
    let ret = ''
    // has potential type cast or generic arguments that uses types
    const ast = parseExpression(exp, { plugins: ['typescript'] })
    walkIdentifiers(ast, node => {
      ret += `,` + node.name
    })
    return ret
  }
  return stripStrings(exp)
}

function stripStrings(exp: string) {
  return exp
    .replace(/'[^']*'|"[^"]*"/g, '')
    .replace(/`[^`]+`/g, stripTemplateString)
}

function stripTemplateString(str: string): string {
  const interpMatch = str.match(/\${[^}]+}/g)
  if (interpMatch) {
    return interpMatch.map(m => m.slice(2, -1)).join(',')
  }
  return ''
}

function isImportUsed(
  local: string,
  sfc: SFCDescriptor,
  isTS: boolean
): boolean {
  return new RegExp(
    // #4274 escape $ since it's a special char in regex
    // (and is the only regex special char that is valid in identifiers)
    `[^\\w$_]${local.replace(/\$/g, '\\$')}[^\\w$_]`
  ).test(resolveTemplateUsageCheckString(sfc, isTS))
}

/**
 * Note: this comparison assumes the prev/next script are already identical,
 * and only checks the special case where <script setup> unused import
 * pruning result changes due to template changes.
 */
export function hmrShouldReload(
  prevImports: Record<string, ImportBinding>,
  next: SFCDescriptor
): boolean {
  if (!next.scriptSetup) {
    return false
  }

  const isTS = next.scriptSetup.lang === 'ts' || next.scriptSetup.lang === 'tsx'
  // for each previous import, check if its used status remain the same based on
  // the next descriptor's template
  for (const key in prevImports) {
    // if an import was previous unused, but now is used, we need to force
    // reload so that the script now includes that import.
    if (!prevImports[key].isUsedInTemplate && isImportUsed(key, next, isTS)) {
      return true
    }
  }

  return false
}
