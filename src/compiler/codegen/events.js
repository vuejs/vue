/* @flow */

const fnExpRE = /^\s*([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/
const simplePathRE = /^\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?']|\[".*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*\s*$/

// keyCode aliases
const keyCodes: { [key: string]: number | Array<number> } = {
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

const modifierCode: { [key: string]: string } = {
  stop: '$event.stopPropagation();',
  prevent: '$event.preventDefault();',
  // #4868: modifiers that prevent the execution of the listener
  // need to explicitly return null so that we can determine whether to remove
  // the listener for .once
  self: 'if($event.target !== $event.currentTarget)return null;',
  ctrl: 'if(!$event.ctrlKey)return null;',
  shift: 'if(!$event.shiftKey)return null;',
  alt: 'if(!$event.altKey)return null;',
  meta: 'if(!$event.metaKey)return null;',
  left: 'if($event.button !== 0)return null;',
  middle: 'if($event.button !== 1)return null;',
  right: 'if($event.button !== 2)return null;'
}

export function genHandlers (events: ASTElementHandlers, native?: boolean): string {
  let res = native ? 'nativeOn:{' : 'on:{'
  for (const name in events) {
    res += `"${name}":${genHandler(name, events[name])},`
  }
  return res.slice(0, -1) + '}'
}

function genHandler (
  name: string,
  handler: ASTElementHandler | Array<ASTElementHandler>
): string {
  if (!handler) {
    return 'function(){}'
  } else if (Array.isArray(handler)) {
    return `[${handler.map(handler => genHandler(name, handler)).join(',')}]`
  } else if (!handler.modifiers) {
    return fnExpRE.test(handler.value) || simplePathRE.test(handler.value)
      ? handler.value
      : `function($event){${handler.value}}`
  } else {
    let code = ''
    const keys = []
    for (const key in handler.modifiers) {
      if (modifierCode[key]) {
        code += modifierCode[key]
      } else {
        keys.push(key)
      }
    }
    if (keys.length) {
      code = genKeyFilter(keys) + code
    }
    const handlerCode = simplePathRE.test(handler.value)
      ? handler.value + '($event)'
      : handler.value
    return `function($event){${code}${handlerCode}}`
  }
}

function genKeyFilter (keys: Array<string>): string {
  return `if(${keys.map(genFilterCode).join('&&')})return null;`
}

function genFilterCode (key: string): string {
  const keyVal = parseInt(key, 10)
  if (keyVal) {
    return `$event.keyCode!==${keyVal}`
  }
  const alias = keyCodes[key]
  return `_k($event.keyCode,${JSON.stringify(key)}${alias ? ',' + JSON.stringify(alias) : ''})`
}
