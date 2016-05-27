/* @flow */

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
  if (el.tag === 'select') {
    return genSelect(el, value)
  } else {
    switch (el.attrsMap.type) {
      case 'checkbox':
        genCheckboxModel(el, value)
        break
      case 'radio':
        genRadioModel(el, value)
        break
      default:
        return genDefaultModel(el, value, modifiers)
    }
  }
}

function genCheckboxModel (el: ASTElement, value: ?string) {
  if (process.env.NODE_ENV !== 'production' &&
    el.attrsMap.checked != null) {
    warn(
      `<${el.tag} v-model="${value}" checked>:\n` +
      `inline checked attributes will be ignored when using v-model. ` +
      'Declare initial values in the component\'s data option instead.'
    )
  }
  const valueBinding = getBindingAttr(el, 'value')
  const trueValueBinding = getBindingAttr(el, 'true-value') || 'true'
  const falseValueBinding = getBindingAttr(el, 'false-value') || 'false'
  addProp(el, 'checked',
    `Array.isArray(${value})` +
      `?(${value}).indexOf(${valueBinding})>-1` +
      `:(${value})===(${trueValueBinding})`
  )
  addHandler(el, 'change',
    `var $$a=${value},` +
        '$$el=$event.target,' +
        `$$c=$$el.checked?(${trueValueBinding}):(${falseValueBinding});` +
    'if(Array.isArray($$a)){' +
      `var $$v=${valueBinding},` +
          '$$i=$$a.indexOf($$v);' +
      'if($$c){$$i<0&&$$a.push($$v)}' +
      'else{$$i>-1&&$$a.splice($$i,1)}' +
    `}else{${value}=$$c}`
  )
}

function genRadioModel (el: ASTElement, value: ?string) {
  if (process.env.NODE_ENV !== 'production' &&
    el.attrsMap.checked != null) {
    warn(
      `<${el.tag} v-model="${value}" checked>:\n` +
      `inline checked attributes will be ignored when using v-model. ` +
      'Declare initial values in the component\'s data option instead.'
    )
  }
  const valueBinding = getBindingAttr(el, 'value')
  addProp(el, 'checked', `(${value})===(${valueBinding})`)
  addHandler(el, 'change', `${value}=${valueBinding}`)
}

function genDefaultModel (
  el: ASTElement,
  value: ?string,
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
  const event = lazy ? 'change' : 'input'
  const needCompositionGuard = !lazy && type !== 'range'

  const valueExpression = `$event.target.value${trim ? '.trim()' : ''}`
  let code = number || type === 'number'
    ? `${value}=Number(${valueExpression})`
    : `${value}=${valueExpression}`
  if (needCompositionGuard) {
    code = `if($event.target.composing)return;${code}`
  }
  addProp(el, 'value', `(${value})`)
  addHandler(el, event, code)
  if (needCompositionGuard) {
    // need runtime directive code to help with composition events
    return true
  }
}

function genSelect (el: ASTElement, value: ?string) {
  if (process.env.NODE_ENV !== 'production') {
    el.children.some(checkOptionWarning)
  }
  const code = `${value}=Array.prototype.filter` +
    `.call($event.target.options,function(o){return o.selected})` +
    `.map(function(o){return "_value" in o ? o._value : o.value})` +
    (el.attrsMap.multiple == null ? '[0]' : '')
  addHandler(el, 'change', code)
  // need runtime to help with possible dynamically generated options
  return true
}

function checkOptionWarning (option: ASTNode) {
  if (option.type === 1 &&
    option.tag === 'option' &&
    option.attrsMap.selected != null) {
    const parentModel = option.parent &&
      option.parent.type === 1 &&
      option.parent.attrsMap['v-model']
    warn(
      `<select v-model="${parentModel}">:\n` +
      'inline selected attributes on <option> will be ignored when using v-model. ' +
      'Declare initial values in the component\'s data option instead.'
    )
    return true
  }
}
