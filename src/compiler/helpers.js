import { isArray } from 'shared/util'

export function addProp (el, name, value) {
  (el.props || (el.props = [])).push({ name, value })
}

export function addAttr (el, name, value) {
  (el.attrs || (el.attrs = [])).push({ name, value })
}

export function addStaticAttr (el, name, value) {
  (el.staticAttrs || (el.staticAttrs = [])).push({ name, value })
}

export function addDirective (el, name, value, arg, modifiers) {
  (el.directives || (el.directives = [])).push({ name, value, arg, modifiers })
}

export function addStyleBinding (el, name, value) {
  const code = `"${name}":${value}`
  el.styleBinding = el.styleBinding
    ? el.styleBinding.replace(/}\s?$/, `,${code}}`)
    : `{${code}}`
}

export function addHook (el, name, code) {
  const hooks = el.hooks || (el.hooks = {})
  const hook = hooks[name]
  if (hook) {
    hook.push(code)
  } else {
    hooks[name] = [code]
  }
}

export function addHandler (el, name, value, modifiers) {
  const events = el.events || (el.events = {})
  // check capture modifier
  if (modifiers && modifiers.capture) {
    delete modifiers.capture
    name = '!' + name // mark the event as captured
  }
  const newHandler = { value, modifiers }
  const handlers = events[name]
  if (isArray(handlers)) {
    handlers.push(newHandler)
  } else if (handlers) {
    events[name] = [handlers, newHandler]
  } else {
    events[name] = newHandler
  }
}

export function getBindingAttr (el, name, getStatic) {
  const staticValue = getStatic !== false && getAndRemoveAttr(el, name)
  return staticValue || staticValue === ''
    ? JSON.stringify(staticValue)
    : (getAndRemoveAttr(el, ':' + name) || getAndRemoveAttr(el, 'v-bind:' + name))
}

export function getAndRemoveAttr (el, name) {
  let val
  if ((val = el.attrsMap[name]) != null) {
    el.attrsMap[name] = null
    const list = el.attrsList
    for (let i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1)
        break
      }
    }
  }
  return val
}
