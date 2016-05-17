/* @flow */

import { genHandlers } from './events'
import { ref } from './directives/ref'
import { baseWarn } from './helpers'
import { noop } from 'shared/util'

const baseDirectives = {
  ref,
  cloak: noop
}

// configurable state
let warn
let platformModules
let platformDirectives
let isPlatformReservedTag
let staticRenderFns
let currentOptions

export function generate (
  ast: ASTElement | void,
  options: CompilerOptions
): {
  render: string,
  staticRenderFns: Array<string>
} {
  // save previous staticRenderFns so generate calls can be nested
  const prevStaticRenderFns: Array<string> = staticRenderFns
  const currentStaticRenderFns: Array<string> = staticRenderFns = []
  currentOptions = options
  warn = options.warn || baseWarn
  platformModules = options.modules || []
  platformDirectives = options.directives || {}
  isPlatformReservedTag = options.isReservedTag || (() => false)
  const code = ast ? genElement(ast) : '__r__(__s__("div"))'
  staticRenderFns = prevStaticRenderFns
  return {
    render: `with (this) { return ${code}}`,
    staticRenderFns: currentStaticRenderFns
  }
}

function genElement (el: ASTElement): string {
  if (el.for) {
    return genFor(el)
  } else if (el.if) {
    return genIf(el)
  } else if (el.tag === 'template' && !el.slotTarget) {
    return genChildren(el)
  } else if (el.tag === 'render') {
    return genRender(el)
  } else if (el.tag === 'slot') {
    return genSlot(el)
  } else if (el.component) {
    return genComponent(el)
  } else {
    // if the element is potentially a component,
    // wrap its children as a thunk.
    const children = el.inlineTemplate
      ? 'undefined'
      : genChildren(el, !isPlatformReservedTag(el.tag) /* asThunk */)
    const namespace = el.ns ? `,'${el.ns}'` : ''
    const code = `__r__(__s__('${el.tag}', ${genData(el)}${namespace}), ${children})`
    if (el.staticRoot) {
      // hoist static sub-trees out
      staticRenderFns.push(`with(this){return ${code}}`)
      return `__m__(${staticRenderFns.length - 1})`
    } else {
      return code
    }
  }
}

function genIf (el: ASTElement): string {
  const exp = el.if
  el.if = null // avoid recursion
  return `(${exp}) ? ${genElement(el)} : ${genElse(el)}`
}

function genElse (el: ASTElement): string {
  return el.elseBlock
    ? genElement(el.elseBlock)
    : 'null'
}

function genFor (el: ASTElement): string {
  const exp = el.for
  const alias = el.alias
  const iterator = el.iterator
  el.for = null // avoid recursion
  return `(${exp})&&__renderList__((${exp}), ` +
    `function(${alias},$index,${iterator || '$key'}){` +
      `return ${genElement(el)}` +
    '})'
}

function genData (el: ASTElement): string {
  if (el.plain) {
    return 'undefined'
  }

  let data = '{'

  // directives first.
  // directives may mutate the el's other properties before they are generated.
  const dirs = genDirectives(el)
  if (dirs) data += dirs + ','

  // pre
  if (el.pre) {
    data += 'pre:true,'
  }
  // key
  if (el.key) {
    data += `key:${el.key},`
  }
  // slot target
  if (el.slotTarget) {
    data += `slot:${el.slotTarget},`
  }
  // platform modules
  platformModules.forEach(module => {
    data += module.genData(el) || ''
  })
  // v-show, used to avoid transition being applied
  // since v-show takes it over
  if (el.attrsMap['v-show']) {
    data += 'show:true,'
  }
  // props
  if (el.props) {
    data += `props:{${genProps(el.props)}},`
  }
  // attributes
  if (el.attrs) {
    data += `attrs:{${genProps(el.attrs)}},`
  }
  // static attributes
  if (el.staticAttrs) {
    data += `staticAttrs:{${genProps(el.staticAttrs)}},`
  }
  // hooks
  if (el.hooks) {
    data += `hook:{${genHooks(el.hooks)}},`
  }
  // event handlers
  if (el.events) {
    data += `${genHandlers(el.events)},`
  }
  // inline-template
  if (el.inlineTemplate) {
    const ast = el.children[0]
    if (process.env.NODE_ENV !== 'production' && (
      el.children.length > 1 || ast.type !== 1
    )) {
      warn('Inline-template components must have exactly one child element.')
    }
    if (ast.type === 1) {
      const inlineRenderFns = generate(ast, currentOptions)
      data += `inlineTemplate:{render:function(){${
        inlineRenderFns.render
      }},staticRenderFns:[${
        inlineRenderFns.staticRenderFns.map(code => `function(){${code}}`).join(',')
      }]}`
    }
  }
  return data.replace(/,$/, '') + '}'
}

function genDirectives (el: ASTElement): string | void {
  const dirs = el.directives
  if (!dirs) return
  let res = 'directives:['
  let hasRuntime = false
  let i, l, dir, needRuntime
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i]
    needRuntime = true
    const gen = platformDirectives[dir.name] || baseDirectives[dir.name]
    if (gen) {
      // compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
      needRuntime = !!gen(el, dir)
    }
    if (needRuntime) {
      hasRuntime = true
      res += `{name:"${dir.name}"${
        dir.value ? `,value:(${dir.value})` : ''
      }${
        dir.arg ? `,arg:"${dir.arg}"` : ''
      }${
        dir.modifiers ? `,modifiers:${JSON.stringify(dir.modifiers)}` : ''
      }},`
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']'
  }
}

function genChildren (el: ASTElement, asThunk?: boolean): string {
  if (!el.children.length) {
    return 'undefined'
  }
  const code = '[' + el.children.map(genNode).join(',') + ']'
  return asThunk
    ? `function(){return ${code}}`
    : code
}

function genNode (node: ASTNode) {
  if (node.type === 1) {
    return genElement(node)
  } else {
    return genText(node)
  }
}

function genText (text: ASTText | ASTExpression): string {
  return text.type === 2
    ? `(${text.expression})`
    : '__t__(' + JSON.stringify(text.text) + ')'
}

function genRender (el: ASTElement): string {
  return `${el.renderMethod}(${el.renderArgs || 'null'},${genChildren(el)})`
}

function genSlot (el: ASTElement): string {
  const name = el.slotName || '"default"'
  return `($slots[${name}] || ${genChildren(el)})`
}

function genComponent (el: ASTElement): string {
  return `__r__(__s__(${el.component}, ${genData(el)}), ${genChildren(el, true)})`
}

function genProps (props: Array<{ name: string, value: string }>): string {
  let res = ''
  for (let i = 0; i < props.length; i++) {
    const prop = props[i]
    res += `"${prop.name}":${prop.value},`
  }
  return res.slice(0, -1)
}

function genHooks (hooks: { [key: string]: Array<string> }): string {
  let res = ''
  for (const key in hooks) {
    res += `"${key}":function(n1,n2){${hooks[key].join(';')}},`
  }
  return res.slice(0, -1)
}
