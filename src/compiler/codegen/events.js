/* @flow */

const fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/
const fnInvokeRE = /\([^)]*?\);*$/
const simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/

// KeyboardEvent.keyCode aliases
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

// KeyboardEvent.key aliases
const keyNames: { [key: string]: string | Array<string> } = {
  // #7880: IE11 and Edge use `Esc` for Escape key name.
  esc: ['Esc', 'Escape'],
  tab: 'Tab',
  enter: 'Enter',
  // #9112: IE11 uses `Spacebar` for Space key name.
  space: [' ', 'Spacebar'],
  // #7806: IE11 uses key names without `Arrow` prefix for arrow keys.
  up: ['Up', 'ArrowUp'],
  left: ['Left', 'ArrowLeft'],
  right: ['Right', 'ArrowRight'],
  down: ['Down', 'ArrowDown'],
  // #9112: IE11 uses `Del` for Delete key name.
  'delete': ['Backspace', 'Delete', 'Del']
}

// #4868: modifiers that prevent the execution of the listener
// need to explicitly return null so that we can determine whether to remove
// the listener for .once

const modifierCode: { [key: string]: string } = {
  // stop and prevent return undefined
  stop: '$event.stopPropagation()',
  prevent: '$event.preventDefault()',
  self: `$event.target !== $event.currentTarget`,
  ctrl: `!$event.ctrlKey`,
  shift: `!$event.shiftKey`,
  alt: `!$event.altKey`,
  meta: `!$event.metaKey`,
  left: `('button' in $event && $event.button !== 0)`,
  middle: `('button' in $event && $event.button !== 1)`,
  right: `('button' in $event && $event.button !== 2)`
}

class modifierCodeMerger {
  modifierCodeList: Array<string>;
  stopAndPreventCount: number;

  constructor () {
    this.modifierCodeList = []
    this.stopAndPreventCount = 0
  }

  pushCode (modifierCode: string) {
    this.modifierCodeList.push(modifierCode)
  }

  unshiftCode (modifierCode: string) {
    this.modifierCodeList.unshift(modifierCode)
  }

  isOnlyStopPrevent (): boolean {
    return this.stopAndPreventCount === this.modifierCodeList.length
  }

  getMergeCode (): string {
    if (!this.modifierCodeList.length) return '';
    if (this.isOnlyStopPrevent()) {
      return this.modifierCodeList.join(';') + ';'
    }
    return this.modifierCodeList.join('||')
  }
}

export function genHandlers (
  events: ASTElementHandlers,
  isNative: boolean
): string {
  const prefix = isNative ? 'nativeOn:' : 'on:'
  let staticHandlers = ``
  let dynamicHandlers = ``
  for (const name in events) {
    const handlerCode = genHandler(events[name])
    if (events[name] && events[name].dynamic) {
      dynamicHandlers += `${name},${handlerCode},`
    } else {
      staticHandlers += `"${name}":${handlerCode},`
    }
  }
  staticHandlers = `{${staticHandlers.slice(0, -1)}}`
  if (dynamicHandlers) {
    return prefix + `_d(${staticHandlers},[${dynamicHandlers.slice(0, -1)}])`
  } else {
    return prefix + staticHandlers
  }
}

// Generate handler code with binding params on Weex
/* istanbul ignore next */
function genWeexHandler (params: Array<any>, handlerCode: string) {
  let innerHandlerCode = handlerCode
  const exps = params.filter(exp => simplePathRE.test(exp) && exp !== '$event')
  const bindings = exps.map(exp => ({ '@binding': exp }))
  const args = exps.map((exp, i) => {
    const key = `$_${i + 1}`
    innerHandlerCode = innerHandlerCode.replace(exp, key)
    return key
  })
  args.push('$event')
  return '{\n' +
    `handler:function(${args.join(',')}){${innerHandlerCode}},\n` +
    `params:${JSON.stringify(bindings)}\n` +
    '}'
}

function genHandler (handler: ASTElementHandler | Array<ASTElementHandler>): string {
  if (!handler) {
    return 'function(){}'
  }

  if (Array.isArray(handler)) {
    return `[${handler.map(handler => genHandler(handler)).join(',')}]`
  }

  const isMethodPath = simplePathRE.test(handler.value)
  const isFunctionExpression = fnExpRE.test(handler.value)
  const isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, ''))

  if (!handler.modifiers) {
    if (isMethodPath || isFunctionExpression) {
      return handler.value
    }
    /* istanbul ignore if */
    if (__WEEX__ && handler.params) {
      return genWeexHandler(handler.params, handler.value)
    }
    return `function($event){${
      isFunctionInvocation ? `return ${handler.value}` : handler.value
    }}` // inline statement
  } else {
    const keys = []
    const codeMerger=new modifierCodeMerger();
    for (const key in handler.modifiers) {
      if (modifierCode[key]) {
        codeMerger.pushCode(modifierCode[key]);
        if (key === 'stop' || key === 'prevent') {
          codeMerger.stopAndPreventCount++;
          continue
        }
        // left/right
        if (keyCodes[key]) {
          keys.push(key)
        }
      } else if (key === 'exact') {
        const modifiers: ASTModifiers = (handler.modifiers: any);
        ['ctrl', 'shift', 'alt', 'meta']
          .forEach(keyModifier => modifiers[keyModifier] || codeMerger.pushCode(`$event.${keyModifier}Key`));
      } else {
        keys.push(key)
      }
    }
    if (keys.length) {
      // Make sure modifiers like prevent and stop get executed after key filtering
      codeMerger.unshiftCode(genKeyFilter(keys))
    }
    const handlerCode = isMethodPath
      ? `${handler.value}.apply(null, arguments)`
      : isFunctionExpression
        ? `(${handler.value}).apply(null, arguments)`
        : isFunctionInvocation
          ? `${handler.value}`
          : handler.value;
    let code = '';
    let guardCode = codeMerger.getMergeCode();
    if (handlerCode !== '') {
      if (guardCode) {
        if(codeMerger.isOnlyStopPrevent()){
          code += `${guardCode}return `
        }else{
          code += `return (${guardCode})?null:`
        }
      }
      code += handlerCode
    }else if (guardCode) {
      code += guardCode
    }
    /* istanbul ignore if */
    if (__WEEX__ && handler.params) {
      return genWeexHandler(handler.params, code)
    }
    return `function($event){${code}}`
  }
}

function genKeyFilter (keys: Array<string>): string {
  return (
    // make sure the key filters only apply to KeyboardEvents
    // #9441: can't use 'keyCode' in $event because Chrome autofill fires fake
    // key events that do not have keyCode property...
    `(!$event.type.indexOf('key')&&` +
    `${keys.map(genFilterCode).join('&&')})`
  )
}

function genFilterCode (key: string): string {
  const keyVal = parseInt(key, 10)
  if (keyVal) {
    return `$event.keyCode!==${keyVal}`
  }
  const keyCode = keyCodes[key]
  const keyName = keyNames[key]
  return (
    `_k($event.keyCode,` +
    `${JSON.stringify(key)},` +
    `${JSON.stringify(keyCode)},` +
    `$event.key,` +
    `${JSON.stringify(keyName)}` +
    `)`
  )
}
