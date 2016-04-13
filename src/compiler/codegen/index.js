import { genHandlers, addHandler } from './on'
import { genModel } from './model'
import { genClass } from './class'
import {
  checkSVG,
  parseText,
  parseModifiers,
  removeModifiers,
  getAndRemoveAttr
} from './helpers'

const dirRE = /^v-|^@|^:/
const bindRE = /^:|^v-bind:/
const onRE = /^@|^v-on:/
const mustUsePropsRE = /^(value|selected|checked|muted)$/

export function generate (ast) {
  const code = ast ? genElement(ast) : '__h__("div")'
  return new Function(`with (this) { return ${code}}`)
}

function genElement (el, key) {
  let exp
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    return genFor(el, exp)
  } else if ((exp = getAndRemoveAttr(el, 'v-if'))) {
    return genIf(el, exp)
  } else if (el.tag === 'template') {
    return genChildren(el)
  } else if (el.tag === 'render') {
    return genRender(el)
  } else {
    return `__h__('${el.tag}', ${genData(el, key)}, ${genChildren(el)})`
  }
}

function genIf (el, exp) {
  return `(${exp}) ? ${genElement(el)} : null`
}

function genFor (el, exp) {
  const inMatch = exp.match(/([a-zA-Z_][\w]*)\s+(?:in|of)\s+(.*)/)
  if (!inMatch) {
    throw new Error('Invalid v-for expression: ' + exp)
  }
  const alias = inMatch[1].trim()
  exp = inMatch[2].trim()
  let key = getAndRemoveAttr(el, 'track-by')
  if (!key) {
    key = 'undefined'
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
  let attrs = 'attrs:{'
  let props = 'props:{'
  let events = {}
  let hasAttrs = false
  let hasProps = false
  let hasEvents = false

  // key
  if (key) {
    data += `key:${key},`
  }

  // check SVG namespace.
  // this has the side effect of marking all children if the tag itself is <svg>
  if (checkSVG(el)) {
    data += 'svg:true,'
  }

  // class
  // do it before other attributes becaues it removes static class
  // and class bindings from the element
  data += genClass(el)

  // parent elements my need to add props to children
  // e.g. select
  if (el.props) {
    hasProps = true
    props += el.props + ','
  }

  // loop attributes
  for (let i = 0, l = el.attrs.length; i < l; i++) {
    let attr = el.attrs[i]
    let name = attr.name
    let value = attr.value

    if (dirRE.test(name)) {
      // modifiers
      const modifiers = parseModifiers(name)
      name = removeModifiers(name)
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
        addHandler(events, name, value, modifiers)
      } else if (name === 'v-model') {
        hasProps = hasEvents = true
        props += genModel(el, events, value, modifiers) + ','
      } else {
        // TODO: normal directives
      }
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
    data += genHandlers(events)
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
      return `(exp==null?'':String(${exp}))`
    } else {
      return JSON.stringify(text)
    }
  }
}

function genRender (el) {
  const method = el.attrsMap.method
  const args = el.attrsMap.args
  if (process.env.NODE_ENV !== 'production' && !method) {
    console.error('method attribute is required on <render>.')
    return 'undefined'
  }
  return `${method}(${args})`
}
