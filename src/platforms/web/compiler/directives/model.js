/* @flow */

import { isIE } from 'core/util/env'
import { addHandler, addProp, getBindingAttr, parseModel } from 'compiler/helpers'

let warn

export default function model (
  el: ASTElement,
  dir: ASTDirective,
  _warn: Function
): ?boolean {
  warn = _warn
  const value = dir.value
  const modifiers = dir.modifiers
  const tag = el.tag
  const type = el.attrsMap.type

  if (process.env.NODE_ENV !== 'production') {
    const dynamicType = el.attrsMap['v-bind:type'] || el.attrsMap[':type']
    if (tag === 'input' && dynamicType) {
      warn(
        `<input :type="${dynamicType}" v-model="${value}">:\n` +
        `v-model does not support dynamic input types. Use v-if branches instead.`
      )
    }
    // inputs with type="file" are read only and setting the input's
    // value will throw an error.
    if (tag === 'input' && type === 'file') {
      warn(
        `<${el.tag} v-model="${value}" type="file">:\n` +
        `File inputs are read only. Use a v-on:change listener instead.`
      )
    }
  }

  if (tag === 'select') {
    genSelect(el, value, modifiers)
  } else if (tag === 'input' && type === 'checkbox') {
    genCheckboxModel(el, value, modifiers)
  } else if (tag === 'input' && type === 'radio') {
    genRadioModel(el, value, modifiers)
  } else {
    genDefaultModel(el, value, modifiers)
  }

  // ensure runtime directive metadata
  return true
}

function genCheckboxModel (
  el: ASTElement,
  value: string,
  modifiers: ?ASTModifiers
) {
  if (process.env.NODE_ENV !== 'production' &&
    el.attrsMap.checked != null) {
    warn(
      `<${el.tag} v-model="${value}" checked>:\n` +
      `inline checked attributes will be ignored when using v-model. ` +
      'Declare initial values in the component\'s data option instead.'
    )
  }
  const number = modifiers && modifiers.number
  const valueBinding = getBindingAttr(el, 'value') || 'null'
  const trueValueBinding = getBindingAttr(el, 'true-value') || 'true'
  const falseValueBinding = getBindingAttr(el, 'false-value') || 'false'
  addProp(el, 'checked',
    `Array.isArray(${value})` +
      `?_i(${value},${valueBinding})>-1` + (
        trueValueBinding === 'true'
          ? `:(${value})`
          : `:_q(${value},${trueValueBinding})`
      )
  )
  addHandler(el, 'click',
    `var $$a=${value},` +
        '$$el=$event.target,' +
        `$$c=$$el.checked?(${trueValueBinding}):(${falseValueBinding});` +
    'if(Array.isArray($$a)){' +
      `var $$v=${number ? '_n(' + valueBinding + ')' : valueBinding},` +
          '$$i=_i($$a,$$v);' +
      `if($$c){$$i<0&&(${value}=$$a.concat($$v))}` +
      `else{$$i>-1&&(${value}=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}` +
    `}else{${value}=$$c}`,
    null, true
  )
}

function genRadioModel (
    el: ASTElement,
    value: string,
    modifiers: ?ASTModifiers
) {
  if (process.env.NODE_ENV !== 'production' &&
    el.attrsMap.checked != null) {
    warn(
      `<${el.tag} v-model="${value}" checked>:\n` +
      `inline checked attributes will be ignored when using v-model. ` +
      'Declare initial values in the component\'s data option instead.'
    )
  }
  const number = modifiers && modifiers.number
  let valueBinding = getBindingAttr(el, 'value') || 'null'
  valueBinding = number ? `_n(${valueBinding})` : valueBinding
  addProp(el, 'checked', `_q(${value},${valueBinding})`)
  addHandler(el, 'click', genAssignmentCode(value, valueBinding), null, true)
}

function genDefaultModel (
  el: ASTElement,
  value: string,
  modifiers: ?ASTModifiers
): ?boolean {
  if (process.env.NODE_ENV !== 'production') {
    if (el.tag === 'input' && el.attrsMap.value) {
      warn(
        `<${el.tag} v-model="${value}" value="${el.attrsMap.value}">:\n` +
        'inline value attributes will be ignored when using v-model. ' +
        'Declare initial values in the component\'s data option instead.'
      )
    }
    if (el.tag === 'textarea' && el.children.length) {
      warn(
        `<textarea v-model="${value}">:\n` +
        'inline content inside <textarea> will be ignored when using v-model. ' +
        'Declare initial values in the component\'s data option instead.'
      )
    }
  }

  const type = el.attrsMap.type
  const { lazy, number, trim } = modifiers || {}
  const event = lazy || (isIE && type === 'range') ? 'change' : 'input'
  const needCompositionGuard = !lazy && type !== 'range'
  const isNative = el.tag === 'input' || el.tag === 'textarea'

  let valueExpression = isNative
    ? `$event.target.value${trim ? '.trim()' : ''}`
    : trim ? `(typeof $event === 'string' ? $event.trim() : $event)` : `$event`
  valueExpression = number || type === 'number'
    ? `_n(${valueExpression})`
    : valueExpression

  let code = genAssignmentCode(value, valueExpression)
  if (isNative && needCompositionGuard) {
    code = `if($event.target.composing)return;${code}`
  }

  addProp(el, 'value', isNative ? `_s(${value})` : `(${value})`)
  addHandler(el, event, code, null, true)
  if (trim || number || type === 'number') {
    addHandler(el, 'blur', '$forceUpdate()')
  }
}

function genSelect (
    el: ASTElement,
    value: string,
    modifiers: ?ASTModifiers
) {
  if (process.env.NODE_ENV !== 'production') {
    el.children.some(checkOptionWarning)
  }

  const number = modifiers && modifiers.number
  const selectedVal = `Array.prototype.filter` +
    `.call($event.target.options,function(o){return o.selected})` +
    `.map(function(o){var val = "_value" in o ? o._value : o.value;` +
    `return ${number ? '_n(val)' : 'val'}})`

  const assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]'
  let code = `var $$selectedVal = ${selectedVal};`
  code = `${code} ${genAssignmentCode(value, assignment)}`
  addHandler(el, 'change', code, null, true)
}

function checkOptionWarning (option: any): boolean {
  if (option.type === 1 &&
    option.tag === 'option' &&
    option.attrsMap.selected != null) {
    warn(
      `<select v-model="${option.parent.attrsMap['v-model']}">:\n` +
      'inline selected attributes on <option> will be ignored when using v-model. ' +
      'Declare initial values in the component\'s data option instead.'
    )
    return true
  }
  return false
}

function genAssignmentCode (value: string, assignment: string): string {
  const modelRs = parseModel(value)
  if (modelRs.idx === null) {
    return `${value}=${assignment}`
  } else {
    return `var $$exp = ${modelRs.exp}, $$idx = ${modelRs.idx};` +
      `if (!Array.isArray($$exp)){` +
        `${value}=${assignment}}` +
      `else{$$exp.splice($$idx, 1, ${assignment})}`
  }
}
