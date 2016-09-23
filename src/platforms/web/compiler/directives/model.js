/* @flow */

import { isIE } from 'core/util/env'
import { addHandler, addProp, getBindingAttr } from 'compiler/helpers'

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
  if (tag === 'select') {
    return genSelect(el, value)
  } else if (tag === 'input' && type === 'checkbox') {
    genCheckboxModel(el, value)
  } else if (tag === 'input' && type === 'radio') {
    genRadioModel(el, value)
  } else {
    return genDefaultModel(el, value, modifiers)
  }
}

function genCheckboxModel (el: ASTElement, value: string) {
  if (process.env.NODE_ENV !== 'production' &&
    el.attrsMap.checked != null) {
    warn(
      `<${el.tag} v-model="${value}" checked>:\n` +
      `inline checked attributes will be ignored when using v-model. ` +
      'Declare initial values in the component\'s data option instead.'
    )
  }
  const valueBinding = getBindingAttr(el, 'value') || 'null'
  const trueValueBinding = getBindingAttr(el, 'true-value') || 'true'
  const falseValueBinding = getBindingAttr(el, 'false-value') || 'false'
  addProp(el, 'checked',
    `Array.isArray(${value})` +
      `?_i(${value},${valueBinding})>-1` +
      `:_q(${value},${trueValueBinding})`
  )
  addHandler(el, 'change',
    `var $$a=${value},` +
        '$$el=$event.target,' +
        `$$c=$$el.checked?(${trueValueBinding}):(${falseValueBinding});` +
    'if(Array.isArray($$a)){' +
      `var $$v=${valueBinding},` +
          '$$i=_i($$a,$$v);' +
      `if($$c){$$i<0&&(${value}=$$a.concat($$v))}` +
      `else{$$i>-1&&(${value}=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}` +
    `}else{${value}=$$c}`,
    null, true
  )
}

function genRadioModel (el: ASTElement, value: string) {
  if (process.env.NODE_ENV !== 'production' &&
    el.attrsMap.checked != null) {
    warn(
      `<${el.tag} v-model="${value}" checked>:\n` +
      `inline checked attributes will be ignored when using v-model. ` +
      'Declare initial values in the component\'s data option instead.'
    )
  }
  const valueBinding = getBindingAttr(el, 'value') || 'null'
  addProp(el, 'checked', `_q(${value},${valueBinding})`)
  addHandler(el, 'change', `${value}=${valueBinding}`, null, true)
}

function genDefaultModel (
  el: ASTElement,
  value: string,
  modifiers: ?Object
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

  const valueExpression = isNative
    ? `$event.target.value${trim ? '.trim()' : ''}`
    : `$event`
  let code = number || type === 'number'
    ? `${value}=_n(${valueExpression})`
    : `${value}=${valueExpression}`
  if (isNative && needCompositionGuard) {
    code = `if($event.target.composing)return;${code}`
  }
  addProp(el, 'value', isNative ? `_s(${value})` : `(${value})`)
  addHandler(el, event, code, null, true)
  if (needCompositionGuard) {
    // need runtime directive code to help with composition events
    return true
  }
}

function genSelect (el: ASTElement, value: string) {
  if (process.env.NODE_ENV !== 'production') {
    el.children.some(checkOptionWarning)
  }
  const code = `${value}=Array.prototype.filter` +
    `.call($event.target.options,function(o){return o.selected})` +
    `.map(function(o){return "_value" in o ? o._value : o.value})` +
    (el.attrsMap.multiple == null ? '[0]' : '')
  addHandler(el, 'change', code, null, true)
  // need runtime to help with possible dynamically generated options
  return true
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
