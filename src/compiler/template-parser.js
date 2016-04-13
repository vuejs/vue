import { decodeHTML } from 'entities'
import HTMLParser from './html-parser'

const dirRE = /^v-|^@|^:/
const bindRE = /^:|^v-bind:/
const onRE = /^@|^v-on:/
const modifierRE = /\.[^\.]+/g
const mustUsePropsRE = /^(value|selected|checked|muted)$/

// this map covers SVG elements that can appear as template root nodes
const svgMap = {
  svg: 1,
  g: 1,
  defs: 1,
  symbol: 1,
  use: 1,
  image: 1,
  text: 1,
  circle: 1,
  ellipse: 1,
  line: 1,
  path: 1,
  polygon: 1,
  polyline: 1,
  rect: 1
}

/**
 * Convert HTML string to AST
 *
 * @param {String} template
 * @param {Boolean} preserveWhitespace
 * @return {Object}
 */

export function parse (template, preserveWhitespace) {
  let root
  let currentParent
  let stack = []
  let inSvg = false
  let svgIndex = -1
  HTMLParser(template, {
    html5: true,
    start (tag, attrs, unary) {
      let element = {
        tag,
        attrs,
        attrsMap: makeAttrsMap(attrs),
        parent: currentParent,
        children: []
      }

      // check svg
      if (inSvg) {
        element.svg = true
      } else if (svgMap[tag]) {
        element.svg = true
        inSvg = true
        svgIndex = stack.length
      }

      processControlFlow(element)
      processClassBinding(element)
      processStyleBinding(element)
      processAttributes(element)

      // tree management
      if (!root) {
        root = element
      } else if (process.env.NODE_ENV !== 'production' && !stack.length) {
        console.error(
          'Component template should contain exactly one root element:\n\n' + template
        )
      }
      if (currentParent) {
        currentParent.children.push(element)
      }
      if (!unary) {
        currentParent = element
        stack.push(element)
      }
    },
    end () {
      stack.length -= 1
      currentParent = stack[stack.length - 1]
      if (inSvg && stack.length <= svgIndex) {
        inSvg = false
        svgIndex = -1
      }
    },
    chars (text) {
      if (!currentParent) {
        if (process.env.NODE_ENV !== 'production' && !root) {
          console.error(
            'Component template should contain exactly one root element:\n\n' + template
          )
        }
        return
      }
      text = currentParent.tag === 'pre'
        ? decodeHTML(text)
        : text.trim()
          ? decodeHTML(text)
          : preserveWhitespace
            ? ' '
            : null
      if (text) {
        currentParent.children.push(text)
      }
    }
  })
  return root
}

function processControlFlow (el) {
  let exp
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    el['for'] = exp
    if ((exp = getAndRemoveAttr(el, 'track-by'))) {
      el.key = exp
    }
  }
  if ((exp = getAndRemoveAttr(el, 'v-if'))) {
    el['if'] = exp
  }
}

function processClassBinding (el) {
  el['class'] = getAndRemoveAttr(el, 'class')
  el.classBinding =
    getAndRemoveAttr(el, ':class') ||
    getAndRemoveAttr(el, 'v-bind:class')
}

function processStyleBinding (el) {
  el.styleBinding =
    getAndRemoveAttr(el, ':style') ||
    getAndRemoveAttr(el, 'v-bind:style')
}

function processAttributes (el) {
  for (let i = 0; i < el.attrs.length; i++) {
    let name = el.attrs[i].name
    let value = el.attrs[i].value
    if (dirRE.test(name)) {
      name = name.replace(dirRE, '')
      // modifiers
      const modifiers = parseModifiers(name)
      if (modifiers) {
        name = name.replace(modifierRE, '')
      }
      if (bindRE.test(name)) { // v-bind
        name = name.replace(bindRE, '')
        if (mustUsePropsRE.test(name)) {
          (el.props || (el.props = [])).push({ name, value })
        } else {
          (el.attrBindings || (el.attrBindings = [])).push({ name, value })
        }
      } else if (onRE.test(name)) { // v-on
        name = name.replace(onRE, '')
        addHandler((el.events || (el.events = {})), name, value, modifiers)
      } else { // normal directives
        (el.directives || (el.directives = [])).push({
          name,
          value,
          modifiers
        })
      }
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
    map[attrs[i].name] = attrs[i].value
  }
  return map
}

function getAndRemoveAttr (el, attr) {
  let val
  if ((val = el.attrsMap[attr])) {
    el.attrsMap[attr] = null
    for (let i = 0, l = el.attrs.length; i < l; i++) {
      if (el.attrs[i].name === attr) {
        el.attrs.splice(i, 1)
        break
      }
    }
  }
  return val
}

function addHandler (events, name, value, modifiers) {
  // check capture modifier
  if (modifiers && modifiers.capture) {
    delete modifiers.capture
    name = '!' + name // mark the event as captured
  }
  const newHandler = { value, modifiers }
  const handlers = events[name]
  if (Array.isArray(handlers)) {
    handlers.push(newHandler)
  } else if (handlers) {
    events[name] = [handlers, newHandler]
  } else {
    events[name] = newHandler
  }
}
