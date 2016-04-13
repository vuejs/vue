import { decodeHTML } from 'entities'
import HTMLParser from './html-parser'
import {
  parseText,
  parseModifiers,
  removeModifiers,
  makeAttrsMap,
  getAndRemoveAttr,
  addHandler
} from './helpers'

const dirRE = /^v-|^@|^:/
const bindRE = /^:|^v-bind:/
const onRE = /^@|^v-on:/

const mustUsePropsRE = /^(value|selected|checked|muted)$/
const forAliasRE = /([a-zA-Z_][\w]*)\s+(?:in|of)\s+(.*)/

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
  let warned = false
  HTMLParser(template, {
    html5: true,
    start (tag, attrs, unary) {
      let element = {
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
      } else if (svgMap[tag]) {
        element.svg = true
        inSvg = true
        svgIndex = stack.length
      }

      processFor(element)
      processIf(element)
      processRender(element)
      processSlot(element)
      processClassBinding(element)
      processStyleBinding(element)
      processAttributes(element)

      // tree management
      if (!root) {
        root = element
      } else if (process.env.NODE_ENV !== 'production' && !stack.length && !warned) {
        warned = true
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
        if (process.env.NODE_ENV !== 'production' && !warned) {
          warned = true
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
        if (text !== ' ') {
          let expression = parseText(text)
          if (expression) {
            currentParent.children.push({
              expression
            })
          } else {
            currentParent.children.push({ text })
          }
        } else {
          currentParent.children.push({ text })
        }
      }
    }
  })
  return root
}

function processFor (el) {
  let exp
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    const inMatch = exp.match(forAliasRE)
    if (process.env.NODE_ENV !== 'production' && !inMatch) {
      console.error(`Invalid v-for expression: ${exp}`)
    }
    el.alias = inMatch[1].trim()
    el['for'] = inMatch[2].trim()
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
    el['if'] = exp
  }
}

function processRender (el) {
  if (el.tag === 'render') {
    el.render = true
    el.method = el.attrsMap.method
    el.args = el.attrsMap.args
    if (process.env.NODE_ENV !== 'production' && !el.method) {
      console.error('method attribute is required on <render>.')
    }
  }
}

function processSlot () {
  // todo
}

function processClassBinding (el) {
  el.staticClass = getAndRemoveAttr(el, 'class')
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
  const list = el.attrsList
  for (let i = 0; i < list.length; i++) {
    let name = list[i].name
    let value = list[i].value
    if (dirRE.test(name)) {
      // modifiers
      const modifiers = parseModifiers(name)
      if (modifiers) {
        name = removeModifiers(name)
      }
      if (bindRE.test(name)) { // v-bind
        name = name.replace(bindRE, '')
        if (mustUsePropsRE.test(name)) {
          (el.props || (el.props = [])).push({ name, value })
        } else {
          (el.attrs || (el.attrs = [])).push({ name, value })
        }
      } else if (onRE.test(name)) { // v-on
        name = name.replace(onRE, '')
        addHandler((el.events || (el.events = {})), name, value, modifiers)
      } else { // normal directives
        name = name.replace(dirRE, '')
        ;(el.directives || (el.directives = [])).push({
          name,
          value,
          modifiers
        })
      }
    } else {
      // literal attribute
      (el.attrs || (el.attrs = [])).push({
        name,
        value: JSON.stringify(value)
      })
    }
  }
}
