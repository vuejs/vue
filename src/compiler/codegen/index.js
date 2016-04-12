import config from '../../config'
import { parseText } from '../text-parser'
import { genEvents, addHandler } from './events'
import { genModel } from './model'
import { getAttr } from './helpers'

const bindRE = /^:|^v-bind:/
const onRE = /^@|^v-on:/
const dirRE = /^v-/
const mustUsePropsRE = /^(value|selected|checked|muted)$/

export function generate (ast) {
  const code = genElement(ast)
  return new Function (`with (this) { return ${code}}`)
}

function genElement (el, key) {
  let exp
  if (exp = getAttr(el, 'v-for')) {
    return genFor(el, exp)
  } else if (exp = getAttr(el, 'v-if')) {
    return genIf(el, exp)
  } else if (el.tag === 'template') {
    return genChildren(el)
  } else {
    return `__h__('${el.tag}', ${genData(el, key) }, ${genChildren(el)})`
  }
}

function genIf (el, exp) {
  return `(${exp}) ? ${genElement(el)} : null`
}

function genFor (el, exp) {
  const inMatch = exp.match(/([a-zA-Z_][\w]*)\s+(?:in|of)\s+(.*)/)
  if (!inMatch) {
    throw new Error('Invalid v-for expression: '+ exp)
  }
  const alias = inMatch[1].trim()
  exp = inMatch[2].trim()
  let key = getAttr(el, 'track-by')
  if (!key) {
    key ='undefined'
  } else if (key !== '$index') {
    key = alias + '["' + key + '"]'
  }
  return `(${exp}) && (${exp}).map(function (${alias}, $index) {return ${genElement(el, key)}})`
}

function genData (el, key) {
  if (!el.attrs.length) {
    return '{}'
  }
  let data = '{'
  if (key) {
    data += `key:${key},`
  }
  const classBinding = getAttr(el, ':class') || getAttr(el, 'v-bind:class')
  if (classBinding) {
    data += `class: ${classBinding},`
  }
  const staticClass = getAttr(el, 'class')
  if (staticClass) {
    data += `staticClass: "${staticClass}",`
  }
  let attrs = `attrs:{`
  let props = `props:{`
  let events = {}
  let hasAttrs = false
  let hasProps = false
  let hasEvents = false
  for (let i = 0, l = el.attrs.length; i < l; i++) {
    let attr = el.attrs[i]
    let name = attr.name
    let value = attr.value
    if (bindRE.test(name)) {
      name = name.replace(bindRE, '')
      if (name === 'style') {
        data += `style: ${value},`
      } else if (mustUsePropsRE.test(name)) {
        hasProps = true
        props += `"${name}": (${value}),`
      } else {
        hasAttrs = true
        attrs += `"${name}": (${value}),`
      }
    } else if (onRE.test(name)) {
      hasEvents = true
      name = name.replace(onRE, '')
      addHandler(events, name, value)
    } else if (name === 'v-model') {
      // TODO: handle other input types
      hasProps = hasEvents = true
      props += genModel(el, events, value)
    } else if (dirRE.test(name)) {
      // TODO: normal directives
    } else {
      hasAttrs = true
      attrs += `"${name}": (${JSON.stringify(attr.value)}),`
    }
  }
  if (hasAttrs) {
    data += attrs.slice(0, -1) + '},'
  }
  if (hasProps) {
    data += props.slice(0, -1) + '},'
  }
  if (hasEvents) {
    data += genEvents(events)
  }
  return data.replace(/,$/, '') + '}'
}

function genChildren (el) {
  if (!el.children.length) {
    return 'undefined'
  }
  return '[' + el.children.map(genNode).join(',') + ']'
}

function genNode (node) {
  if (node.tag) {
    return genElement(node)
  } else {
    return genText(node)
  }
}

function genText (text) {
  if (text === ' ') {
    return '" "'
  } else {
    const exp = parseText(text)
    if (exp) {
      return 'String(' + exp + ')'
    } else {
      return JSON.stringify(text)
    }
  }
}
