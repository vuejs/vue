import { decodeHTML } from 'entities'
import { parseHTML } from './html-parser'
import { parseText } from './text-parser'
import { hyphenate, cached } from 'shared/util'
import {
  getAndRemoveAttr,
  addProp,
  addAttr,
  addStaticAttr,
  addHandler,
  addDirective,
  getBindingAttr,
  baseWarn
} from '../helpers'

const dirRE = /^v-|^@|^:/
const bindRE = /^:|^v-bind:/
const onRE = /^@|^v-on:/
const argRE = /:(.*)$/
const modifierRE = /\.[^\.]+/g
const forAliasRE = /(.*)\s+(?:in|of)\s+(.*)/
const forIteratorRE = /\((.*),(.*)\)/
const camelRE = /[a-z\d][A-Z]/

const decodeHTMLCached = cached(decodeHTML)

// configurable state
let warn
let platformGetTagNamespace
let platformMustUseProp
let delimiters

/**
 * Convert HTML string to AST.
 *
 * @param {String} template
 * @param {Object} options
 * @return {Object}
 */
export function parse (template, options) {
  warn = options.warn || baseWarn
  platformGetTagNamespace = options.getTagNamespace || (() => null)
  platformMustUseProp = options.mustUseProp || (() => false)
  delimiters = options.delimiters
  const stack = []
  let root
  let currentParent
  let inPre = false
  let warned = false
  parseHTML(template, {
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    start (tag, attrs, unary) {
      // check camelCase tag
      if (camelRE.test(tag)) {
        process.env.NODE_ENV !== 'production' && warn(
          `Found camelCase tag in template: <${tag}>. ` +
          `I've converted it to <${hyphenate(tag)}> for you.`
        )
        tag = hyphenate(tag)
      }

      tag = tag.toLowerCase()
      const element = {
        tag,
        attrsList: attrs,
        attrsMap: makeAttrsMap(attrs),
        parent: currentParent,
        children: []
      }

      if (isForbiddenTag(element)) {
        element.forbidden = true
        process.env.NODE_ENV !== 'production' && warn(
          'Templates should only be responsbile for mapping the state to the ' +
          'UI. Avoid placing tags with side-effects in your templates, such as ' +
          `<${tag}>.`
        )
      }

      // check namespace.
      // inherit parent ns if there is one
      let ns
      if ((ns = currentParent && currentParent.ns) ||
          (ns = platformGetTagNamespace(tag))) {
        element.ns = ns
      }

      if (!inPre) {
        processPre(element)
        if (element.pre) {
          inPre = true
        }
      }
      if (inPre) {
        processRawAttrs(element)
      } else {
        processFor(element)
        processIf(element)
        processOnce(element)
        // determine whether this is a plain element after
        // removing if/for/once attributes
        element.plain = !element.key && !attrs.length
        processRender(element)
        processSlot(element)
        processComponent(element)
        processClassBinding(element)
        processStyleBinding(element)
        processTransition(element)
        processAttrs(element)
      }

      // tree management
      if (!root) {
        root = element
      } else if (process.env.NODE_ENV !== 'production' && !stack.length && !warned) {
        warned = true
        warn(
          `Component template should contain exactly one root element:\n\n${template}`
        )
      }
      if (currentParent && !element.forbidden) {
        if (element.else) {
          processElse(element, currentParent)
        } else {
          currentParent.children.push(element)
          element.parent = currentParent
        }
      }
      if (!unary) {
        currentParent = element
        stack.push(element)
      }
    },

    end (tag) {
      // remove trailing whitespace
      const element = stack[stack.length - 1]
      const lastNode = element.children[element.children.length - 1]
      if (lastNode && lastNode.text === ' ') element.children.pop()
      // pop stack
      stack.length -= 1
      currentParent = stack[stack.length - 1]
      // check pre state
      if (element.pre) {
        inPre = false
      }
    },

    chars (text) {
      if (!currentParent) {
        if (process.env.NODE_ENV !== 'production' && !warned) {
          warned = true
          warn(
            'Component template should contain exactly one root element:\n\n' + template
          )
        }
        return
      }
      text = currentParent.tag === 'pre' || text.trim()
        ? decodeHTMLCached(text)
        // only preserve whitespace if its not right after a starting tag
        : options.preserveWhitespace && currentParent.children.length
          ? ' '
          : null
      if (text) {
        let expression
        if (!inPre && text !== ' ' && (expression = parseText(text, delimiters))) {
          currentParent.children.push({ expression })
        } else {
          currentParent.children.push({ text })
        }
      }
    }
  })
  return root
}

function processPre (el) {
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    el.pre = true
  }
}

function processRawAttrs (el) {
  const l = el.attrsList.length
  if (l) {
    el.attrs = new Array(l)
    for (let i = 0; i < l; i++) {
      el.attrs[i] = {
        name: el.attrsList[i].name,
        value: JSON.stringify(el.attrsList[i].value)
      }
    }
  }
}

function processFor (el) {
  let exp
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    const inMatch = exp.match(forAliasRE)
    if (!inMatch) {
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid v-for expression: ${exp}`
      )
      return
    }
    el.for = inMatch[2].trim()
    const alias = inMatch[1].trim()
    const iteratorMatch = alias.match(forIteratorRE)
    if (iteratorMatch) {
      el.iterator = iteratorMatch[1].trim()
      el.alias = iteratorMatch[2].trim()
    } else {
      el.alias = alias
    }
    if ((exp = getAndRemoveAttr(el, 'track-by'))) {
      el.key = exp
    }
  }
}

function processIf (el) {
  const exp = getAndRemoveAttr(el, 'v-if')
  if (exp) {
    el.if = exp
  }
  if (getAndRemoveAttr(el, 'v-else') != null) {
    el.else = true
  }
}

function processElse (el, parent) {
  const prev = findPrevElement(parent.children)
  if (prev && prev.if) {
    prev.elseBlock = el
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `v-else used on element <${el.tag}> without corresponding v-if.`
    )
  }
}

function processOnce (el) {
  const once = getAndRemoveAttr(el, 'v-once')
  if (once != null) {
    el.once = true
  }
}

function processRender (el) {
  if (el.tag === 'render') {
    el.render = true
    el.renderMethod = el.attrsMap[':method'] || el.attrsMap['v-bind:method']
    el.renderArgs = el.attrsMap[':args'] || el.attrsMap['v-bind:args']
    if (process.env.NODE_ENV !== 'production') {
      if (el.attrsMap.method) {
        warn('<render> method should use a dynamic binding, e.g. `:method="..."`.')
      } else if (!el.renderMethod) {
        warn('method attribute is required on <render>.')
      }
      if (el.attrsMap.args) {
        warn('<render> args should use a dynamic binding, e.g. `:args="..."`.')
      }
    }
  }
}

function processSlot (el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name')
  } else {
    const slotTarget = getBindingAttr(el, 'slot')
    if (slotTarget) {
      el.slotTarget = slotTarget
    }
  }
}

function processComponent (el) {
  const isBinding = getBindingAttr(el, 'is')
  if (isBinding) {
    el.component = isBinding
  }
  if (getAndRemoveAttr(el, 'inline-template') != null) {
    el.inlineTemplate = true
  }
}

function processClassBinding (el) {
  const staticClass = getAndRemoveAttr(el, 'class')
  if (process.env.NODE_ENV !== 'production') {
    const expression = parseText(staticClass, delimiters)
    if (expression) {
      warn(
        `class="${staticClass}": ` +
        'Interpolation inside attributes has been deprecated. ' +
        'Use v-bind or the colon shorthand instead.'
      )
    }
  }
  el.staticClass = JSON.stringify(staticClass)
  const classBinding = getBindingAttr(el, 'class', false /* getStatic */)
  if (classBinding) {
    el.classBinding = classBinding
  }
}

function processStyleBinding (el) {
  const styleBinding = getBindingAttr(el, 'style', false /* getStatic */)
  if (styleBinding) {
    el.styleBinding = styleBinding
  }
}

function processTransition (el) {
  let transition = getBindingAttr(el, 'transition')
  if (transition === '""') {
    transition = true
  }
  if (transition) {
    el.transition = transition
    el.transitionOnAppear = getBindingAttr(el, 'transition-on-appear') != null
  }
}

function processAttrs (el) {
  const list = el.attrsList
  let i, l, name, value, arg, modifiers
  for (i = 0, l = list.length; i < l; i++) {
    name = list[i].name
    value = list[i].value
    if (dirRE.test(name)) {
      // modifiers
      modifiers = parseModifiers(name)
      if (modifiers) {
        name = name.replace(modifierRE, '')
      }
      if (bindRE.test(name)) { // v-bind
        name = name.replace(bindRE, '')
        if (platformMustUseProp(name)) {
          addProp(el, name, value)
        } else {
          addAttr(el, name, value)
        }
      } else if (onRE.test(name)) { // v-on
        name = name.replace(onRE, '')
        addHandler(el, name, value, modifiers)
      } else { // normal directives
        name = name.replace(dirRE, '')
        // parse arg
        if ((arg = name.match(argRE)) && (arg = arg[1])) {
          name = name.slice(0, -(arg.length + 1))
        }
        addDirective(el, name, value, arg, modifiers)
      }
    } else {
      // literal attribute
      if (process.env.NODE_ENV !== 'production') {
        const expression = parseText(value, delimiters)
        if (expression) {
          warn(
            `${name}="${value}": ` +
            'Interpolation inside attributes has been deprecated. ' +
            'Use v-bind or the colon shorthand instead.'
          )
        }
      }
      addStaticAttr(el, name, JSON.stringify(value))
    }
  }
}

function parseModifiers (name) {
  const match = name.match(modifierRE)
  if (match) {
    const ret = {}
    match.forEach(m => { ret[m.slice(1)] = true })
    return ret
  }
}

function makeAttrsMap (attrs) {
  const map = {}
  for (let i = 0, l = attrs.length; i < l; i++) {
    if (process.env.NODE_ENV !== 'production' && map[attrs[i].name]) {
      warn('duplicate attribute: ' + attrs[i].name)
    }
    map[attrs[i].name] = attrs[i].value
  }
  return map
}

function findPrevElement (children) {
  let i = children.length
  while (i--) {
    if (children[i].tag) return children[i]
  }
}

function isForbiddenTag (el) {
  return (
    el.tag === 'style' ||
    (el.tag === 'script' && (
      !el.attrsMap.type ||
      el.attrsMap.type === 'text/javascript'
    ))
  )
}
