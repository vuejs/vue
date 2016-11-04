/* @flow */

import { genHandlers } from './events'
import { baseWarn, pluckModuleFunction } from '../helpers'
import baseDirectives from '../directives/index'

// configurable state
let warn
let transforms
let dataGenFns
let platformDirectives
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
  transforms = pluckModuleFunction(options.modules, 'transformCode')
  dataGenFns = pluckModuleFunction(options.modules, 'genData')
  platformDirectives = options.directives || {}
  const code = ast ? genElement(ast) : '_h("div")'
  staticRenderFns = prevStaticRenderFns
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: currentStaticRenderFns
  }
}

function genElement (el: ASTElement): string {
  if (el.staticRoot && !el.staticProcessed) {
    // hoist static sub-trees out
    el.staticProcessed = true
    staticRenderFns.push(`with(this){return ${genElement(el)}}`)
    return `_m(${staticRenderFns.length - 1}${el.staticInFor ? ',true' : ''})`
  } else if (el.for && !el.forProcessed) {
    return genFor(el)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el)
  } else if (el.tag === 'template' && !el.slotTarget) {
    return genChildren(el) || 'void 0'
  } else if (el.tag === 'slot') {
    return genSlot(el)
  } else {
    // component or element
    let code
    if (el.component) {
      code = genComponent(el.component, el)
    } else {
      const data = el.plain ? undefined : genData(el)

      const children = el.inlineTemplate ? null : genChildren(el)
      code = `_h('${el.tag}'${
        data ? `,${data}` : '' // data
      }${
        children ? `,${children}` : '' // children
      })`
    }
    // module transforms
    for (let i = 0; i < transforms.length; i++) {
      code = transforms[i](el, code)
    }
    return code
  }
}

function genIf (el: any): string {
  const exp = el.if
  el.ifProcessed = true // avoid recursion
  return `(${exp})?${genElement(el)}:${genElse(el)}`
}

function genElse (el: ASTElement): string {
  return el.elseBlock
    ? genElement(el.elseBlock)
    : '_e()'
}

function genFor (el: any): string {
  const exp = el.for
  const alias = el.alias
  const iterator1 = el.iterator1 ? `,${el.iterator1}` : ''
  const iterator2 = el.iterator2 ? `,${el.iterator2}` : ''
  el.forProcessed = true // avoid recursion
  return `_l((${exp}),` +
    `function(${alias}${iterator1}${iterator2}){` +
      `return ${genElement(el)}` +
    '})'
}

function genData (el: ASTElement): string {
  let data = '{'

  // directives first.
  // directives may mutate the el's other properties before they are generated.
  const dirs = genDirectives(el)
  if (dirs) data += dirs + ','

  // key
  if (el.key) {
    data += `key:${el.key},`
  }
  // ref
  if (el.ref) {
    data += `ref:${el.ref},`
  }
  if (el.refInFor) {
    data += `refInFor:true,`
  }
  // record original tag name for components using "is" attribute
  if (el.component) {
    data += `tag:"${el.tag}",`
  }
  // slot target
  if (el.slotTarget) {
    data += `slot:${el.slotTarget},`
  }
  // module data generation functions
  for (let i = 0; i < dataGenFns.length; i++) {
    data += dataGenFns[i](el)
  }
  // attributes
  if (el.attrs) {
    data += `attrs:{${genProps(el.attrs)}},`
  }
  // DOM props
  if (el.props) {
    data += `domProps:{${genProps(el.props)}},`
  }
  // event handlers
  if (el.events) {
    data += `${genHandlers(el.events)},`
  }
  if (el.nativeEvents) {
    data += `${genHandlers(el.nativeEvents, true)},`
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
  data = data.replace(/,$/, '') + '}'
  // v-bind data wrap
  if (el.wrapData) {
    data = el.wrapData(data)
  }
  return data
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
      needRuntime = !!gen(el, dir, warn)
    }
    if (needRuntime) {
      hasRuntime = true
      res += `{name:"${dir.name}",rawName:"${dir.rawName}"${
        dir.value ? `,value:(${dir.value}),expression:${JSON.stringify(dir.value)}` : ''
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

function genChildren (el: ASTElement): string | void {
  if (el.children.length) {
    return '[' + el.children.map(genNode).join(',') + ']'
  }
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
    ? text.expression // no need for () because already wrapped in _s()
    : JSON.stringify(text.text)
}

function genSlot (el: ASTElement): string {
  const slotName = el.slotName || '"default"'
  const children = genChildren(el)
  return `_t(${slotName}${
    children ? `,${children}` : ''
  })`
}

// componentName is el.component, take it as argument to shun flow's pessimistic refinement
function genComponent (componentName, el): string {
  const children = el.inlineTemplate ? null : genChildren(el)
  return `_h(${componentName},${genData(el)}${
    children ? `,${children}` : ''
  })`
}

function genProps (props: Array<{ name: string, value: string }>): string {
  let res = ''
  for (let i = 0; i < props.length; i++) {
    const prop = props[i]
    res += `"${prop.name}":${prop.value},`
  }
  return res.slice(0, -1)
}
