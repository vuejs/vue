import { genHandlers } from './events'
import { ref } from './directives/ref'
import { baseWarn } from './helpers'

const baseDirectives = {
  ref,
  cloak: function () {} // noop
}

// configurable state
let warn
let platformDirectives
let isPlatformReservedTag
let staticRenderFns
let currentOptions

export function generate (ast, options) {
  // save previous staticRenderFns so generate calls can be nested
  const prevStaticRenderFns = staticRenderFns
  const currentStaticRenderFns = staticRenderFns = []
  currentOptions = options
  warn = options.warn || baseWarn
  platformDirectives = options.directives || {}
  isPlatformReservedTag = options.isReservedTag || (() => false)
  const code = ast ? genElement(ast) : '__h__("div")'
  staticRenderFns = prevStaticRenderFns
  return {
    render: `with (this) { return ${code}}`,
    staticRenderFns: currentStaticRenderFns
  }
}

function genElement (el) {
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
  } else if (el.tag === 'component') {
    return genComponent(el)
  } else {
    // if the element is potentially a component,
    // wrap its children as a thunk.
    const children = el.inlineTemplate
      ? 'undefined'
      : genChildren(el, !isPlatformReservedTag(el.tag) /* asThunk */)
    const namespace = el.ns ? `,'${el.ns}'` : ''
    const code = `__h__('${el.tag}', ${genData(el)}, ${children}${namespace})`
    if (el.staticRoot) {
      // hoist static sub-trees out
      staticRenderFns.push(`with(this){return ${code}}`)
      return `_staticTrees[${staticRenderFns.length - 1}]`
    } else {
      return code
    }
  }
}

function genIf (el) {
  const exp = el.if
  el.if = false // avoid recursion
  return `(${exp}) ? ${genElement(el)} : ${genElse(el)}`
}

function genElse (el) {
  return el.elseBlock
    ? genElement(el.elseBlock)
    : 'null'
}

function genFor (el) {
  const exp = el.for
  const alias = el.alias
  const iterator = el.iterator
  el.for = false // avoid recursion
  return `(${exp})&&__renderList__((${exp}), ` +
    `function(${alias},$index,${iterator || '$key'}){` +
      `return ${genElement(el)}` +
    '})'
}

function genData (el) {
  if (el.plain) {
    return 'undefined'
  }

  let data = '{'

  // directives first.
  // directives may mutate the el's other properties before they are generated.
  if (el.directives) {
    const dirs = genDirectives(el)
    if (dirs) data += dirs + ','
  }
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
  // class
  if (el.staticClass) {
    data += `staticClass:${el.staticClass},`
  }
  if (el.classBinding) {
    data += `class:${el.classBinding},`
  }
  // style
  if (el.styleBinding) {
    data += `style:${el.styleBinding},`
  }
  // transition
  if (el.transition) {
    data += `transition:{definition:(${el.transition}),appear:${el.transitionOnAppear}},`
  }
  // v-show, used to avoid transition being applied
  // since v-show takes it over
  if (el.attrsMap['v-show'] || el.show) {
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
    if (process.env.NODE_ENV !== 'production' && (
      el.children.length > 1 || !el.children[0].tag
    )) {
      warn('Inline-template components must have exactly one child element.')
    }
    const inlineRenderFns = generate(el.children[0], currentOptions)
    data += `inlineTemplate:{render:function(){${
      inlineRenderFns.render
    }},staticRenderFns:[${
      inlineRenderFns.staticRenderFns.map(code => `function(){${code}}`).join(',')
    }]}`
  }
  return data.replace(/,$/, '') + '}'
}

function genDirectives (el) {
  const dirs = el.directives
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

function genChildren (el, asThunk) {
  if (!el.children.length) {
    return 'undefined'
  }
  const code = '[' + el.children.map(genNode).join(',') + ']'
  return asThunk
    ? `function(){return ${code}}`
    : code
}

function genNode (node) {
  if (node.tag) {
    return genElement(node)
  } else {
    return genText(node)
  }
}

function genText (text) {
  return text.expression
    ? `(${text.expression})`
    : JSON.stringify(text.text)
}

function genRender (el) {
  return `${el.renderMethod}(${el.renderArgs || 'null'},${genChildren(el)})`
}

function genSlot (el) {
  const name = el.slotName || '"default"'
  return `($slots[${name}] || ${genChildren(el)})`
}

function genComponent (el) {
  return `__h__(${el.component}, ${genData(el)}, ${genChildren(el, true)})`
}

function genProps (props) {
  let res = ''
  for (let i = 0; i < props.length; i++) {
    const prop = props[i]
    res += `"${prop.name}":${prop.value},`
  }
  return res.slice(0, -1)
}

function genHooks (hooks) {
  let res = ''
  for (const key in hooks) {
    res += `"${key}":function(n1,n2){${hooks[key].join(';')}},`
  }
  return res.slice(0, -1)
}
