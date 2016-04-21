import { decodeHTML } from 'entities'
import { parseHTML } from './html-parser'
import { parseText } from './text-parser'
import { hyphenate, makeMap } from '../../shared/util'
import {
  getAndRemoveAttr,
  addProp,
  addAttr,
  addHandler,
  addDirective,
  getBindingAttr
} from '../helpers'

const dirRE = /^v-|^@|^:/
const bindRE = /^:|^v-bind:/
const onRE = /^@|^v-on:/
const argRE = /:(.*)$/
const modifierRE = /\.[^\.]+/g
const forAliasRE = /(.*)\s+(?:in|of)\s+(.*)/
const forIteratorRE = /\((.*),(.*)\)/
const camelRE = /[a-z\d][A-Z]/

// attributes that should be using props for binding
const mustUseProp = makeMap('value,selected,checked,muted')

// this map covers SVG elements that can appear as template root nodes
const isSVG = makeMap('svg,g,defs,symbol,use,image,text,circle,ellipse,line,path,polygon,polyline,rect', true)

// make warning customizable depending on environment.
let warn
const baseWarn = msg => console.error(`[Vue parser]: ${msg}`)

/**
 * Convert HTML string to AST.
 *
 * @param {String} template
 * @param {Object} options
 * @return {Object}
 */

export function parse (template, options) {
  options = options || {}
  warn = options.warn || baseWarn
  const stack = []
  let root
  let currentParent
  let inSvg = false
  let svgIndex = -1
  let inPre = false
  let warned = false
  parseHTML(template, {
    html5: true,

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
        plain: !attrs.length,
        attrsList: attrs,
        attrsMap: makeAttrsMap(attrs),
        parent: currentParent,
        children: []
      }

      // check svg
      if (inSvg) {
        element.svg = true
      } else if (isSVG(tag)) {
        element.svg = true
        inSvg = true
        svgIndex = stack.length
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
      if (currentParent) {
        if (element.else) {
          processElse(element, currentParent)
        } else {
          currentParent.children.push(element)
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
      // check svg state
      if (inSvg && stack.length <= svgIndex) {
        inSvg = false
        svgIndex = -1
      }
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
        ? decodeHTML(text)
        // only preserve whitespace if its not right after a starting tag
        : options.preserveWhitespace && currentParent.children.length
          ? ' '
          : null
      if (text) {
        let expression
        if (!inPre && text !== ' ' && (expression = parseText(text))) {
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
      el.key = exp === '$index'
        ? exp
        : el.alias + '["' + exp + '"]'
    }
  }
}

function processIf (el) {
  let exp = getAndRemoveAttr(el, 'v-if')
  if (exp) {
    el.if = exp
  }
  if (getAndRemoveAttr(el, 'v-else') != null) {
    el.else = true
  }
}

function processElse (el, parent) {
  const prev = findPrevElement(parent.children)
  if (prev && (prev.if || prev.attrsMap['v-show'])) {
    if (prev.if) {
      // v-if
      prev.elseBlock = el
    } else {
      // v-show: simply add a v-show with reversed value
      addDirective(el, 'show', `!(${prev.attrsMap['v-show']})`)
      // also copy its transition
      el.transition = prev.transition
      // als set show to true
      el.show = true
      parent.children.push(el)
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `v-else used on element <${el.tag}> without corresponding v-if/v-show.`
    )
  }
}

function processRender (el) {
  if (el.tag === 'render') {
    el.render = true
    el.renderMethod = el.attrsMap.method
    el.renderArgs = el.attrsMap[':args'] || el.attrsMap['v-bind:args']
    if (process.env.NODE_ENV !== 'production') {
      if (!el.renderMethod) {
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
  }
}

function processComponent (el) {
  if (el.tag === 'component') {
    el.component = getBindingAttr(el, 'is')
  }
}

function processClassBinding (el) {
  const staticClass = getAndRemoveAttr(el, 'class')
  el.staticClass = parseText(staticClass) || JSON.stringify(staticClass)
  el.classBinding = getBindingAttr(el, 'class', false /* getStatic */)
}

function processStyleBinding (el) {
  el.styleBinding = getBindingAttr(el, 'style', false /* getStatic */)
}

function processTransition (el) {
  el.transition = getBindingAttr(el, 'transition')
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
        if (mustUseProp(name)) {
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
      addAttr(el, name, parseText(value) || JSON.stringify(value))
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
