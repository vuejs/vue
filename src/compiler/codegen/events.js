import { isArray } from '../../util/index'

const simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/

export function addHandler (events, name, value) {
  const handlers = events[name]
  if (isArray(handlers)) {
    handlers.push(value)
  } else if (handlers) {
    events[name] = [handlers, value]
  } else {
    events[name] = value
  }
}

export function genEvents (events) {
  let res = 'on:{'
  for (var name in events) {
    res += `"${name}":${genHandler(events[name])},`
  }
  return res.slice(0, -1) + '}'
}

function genHandler (value) {
  // TODO support modifiers
  if (!value) {
    return `function(){}`
  } else if (isArray(value)) {
    return `[${value.map(genHandler).join(',')}]`
  } else if (simplePathRE.test(value)) {
    return value
  } else {
    return `function($event){${value}}`
  }
}
