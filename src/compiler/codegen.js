import { parseText } from './text-parser'

const bindRE = /^:|^v-bind:/
const onRE = /^@|^v-on:/
const mustUsePropsRE = /^(value|selected|checked|muted)$/
const simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/

export function generate (ast) {
  const code = genElement(ast)
  return new Function (`with (this) { return ${code}}`)}

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
  return `(${exp}) ? ${genElement(el)} : ''`
}

function genFor (el, exp) {
  const inMatch = exp.match(/([a-zA-Z_][\w]*)\s+(?:in|of)\s+(.*)/)
  if (!inMatch) {
    throw new Error('Invalid v-for expression: '+ exp)
  }
  const alias = inMatch[1].trim()
  exp = inMatch[2].trim()
  const key = el.attrsMap['track-by'] || 'undefined'
  return `(${exp}).map(function (${alias}, $index) {return ${genElement(el, key) }})`
}

function genData (el, key) {
  if (!el.attrs.length) {
    return '{}'
  }
  let data = '{'
  if (key) {
    data += `key:${key},`
  }
  if (el.attrsMap[':class']) {
    data += `class: ${el.attrsMap[':class']},`
  }
  if (el.attrsMap['class']) {
    data += `staticClass: "${el.attrsMap['class']}"`
  }
  let attrs = `attrs:{`
  let props = `props:{`
  let events = `on:{`
  let hasAttrs = false
  let hasProps = false
  let hasEvents = false
  for (let i = 0, l = el.attrs.length; i < l; i++) {
    let attr = el.attrs[i]
    let name = attr.name
    let value = attr.value
    if (bindRE.test(name)) {
      name = name.replace(bindRE, '')
      if (name === 'class') {
        continue
      } else if (name === 'style') {
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
      events += genEvent(name, value)
    } else if (name !== 'class') {
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
    data += events.slice(0, -1) + '},'
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

function genEvent (name, value) {
  // TODO support modifiers
  if (!value) {
    return `"${name}":function(){},`
  } if (simplePathRE.test(value)) {
    return `"${name}":${value},`
  } else {
    return `"${name}":function($event){${value}},`
  }
}

function getAttr (el, attr) {
  let val
  if (val = el.attrsMap[attr]) {
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
