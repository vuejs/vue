import { isArray } from '../shared/util'
const simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/

// keyCode aliases
const keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  'delete': [8, 46]
}

const modifierCode = {
  stop: '$event.stopPropagation();',
  prevent: '$event.preventDefault();',
  self: 'if($event.target !== $event.currentTarget)return;'
}

export function genHandlers (events) {
  let res = 'on:{'
  for (let name in events) {
    res += `"${name}":${genHandler(events[name])},`
  }
  return res.slice(0, -1) + '}'
}

function genHandler (handler) {
  if (!handler) {
    return 'function(){}'
  } else if (isArray(handler)) {
    return `[${handler.map(genHandler).join(',')}]`
  } else if (!handler.modifiers) {
    return simplePathRE.test(handler.value)
      ? handler.value
      : `function($event){${handler.value}}`
  } else {
    let code = 'function($event){'
    for (let key in handler.modifiers) {
      code += modifierCode[key] || genKeyFilter(key)
    }
    let handlerCode = simplePathRE.test(handler.value)
      ? handler.value + '($event)'
      : handler.value
    return code + handlerCode + '}'
  }
}

function genKeyFilter (key) {
  const code = keyCodes[key]
  if (isArray(code)) {
    return `if(${code.map(c => `$event.keyCode!==${c}`).join('&&')})return;`
  } else {
    return `if($event.keyCode!==${code})return;`
  }
}
