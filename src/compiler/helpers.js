/* @flow */

export function baseWarn (msg: string) {
  console.error(`[Vue parser]: ${msg}`)
}

export function addProp (el: ASTElement, name: string, value: string) {
  (el.props || (el.props = [])).push({ name, value })
}

export function addAttr (el: ASTElement, name: string, value: string) {
  (el.attrs || (el.attrs = [])).push({ name, value })
}

export function addStaticAttr (el: ASTElement, name: string, value: string) {
  (el.staticAttrs || (el.staticAttrs = [])).push({ name, value })
}

export function addDirective (
  el: ASTElement,
  name: string,
  value: string,
  arg: ?string,
  modifiers: ?{ [key: string]: true }
) {
  (el.directives || (el.directives = [])).push({ name, value, arg, modifiers })
}

export function addHook (el: ASTElement, name: string, code: string) {
  const hooks = el.hooks || (el.hooks = {})
  const hook = hooks[name]
  /* istanbul ignore if */
  if (hook) {
    hook.push(code)
  } else {
    hooks[name] = [code]
  }
}

export function addHandler (
  el: ASTElement,
  name: string,
  value: string,
  modifiers: ?{ [key: string]: true }
) {
  const events = el.events || (el.events = {})
  // check capture modifier
  if (modifiers && modifiers.capture) {
    delete modifiers.capture
    name = '!' + name // mark the event as captured
  }
  const newHandler = { value, modifiers }
  const handlers = events[name]
  /* istanbul ignore if */
  if (Array.isArray(handlers)) {
    handlers.push(newHandler)
  } else if (handlers) {
    events[name] = [handlers, newHandler]
  } else {
    events[name] = newHandler
  }
}

export function getBindingAttr (
  el: ASTElement,
  name: string,
  getStatic?: boolean
): ?string {
  const dynamicValue =
    getAndRemoveAttr(el, ':' + name) ||
    getAndRemoveAttr(el, 'v-bind:' + name)
  if (dynamicValue != null) {
    return dynamicValue
  } else if (getStatic !== false) {
    const staticValue = getAndRemoveAttr(el, name)
    if (staticValue != null) {
      return JSON.stringify(staticValue)
    }
  }
}

export function getAndRemoveAttr (el: ASTElement, name: string): ?string {
  let val
  if ((val = el.attrsMap[name]) != null) {
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
