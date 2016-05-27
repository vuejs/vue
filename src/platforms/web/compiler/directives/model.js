/* @flow */

import { addHandler, addProp, getBindingAttr } from 'compiler/helpers'

export default function model (
  el: ASTElement,
  dir: ASTDirective,
  warn: Function
): ?boolean {
  const value = dir.value
  const modifiers = dir.modifiers
  if (el.tag === 'select') {
    if (el.attrsMap.multiple != null) {
      genMultiSelect(el, value)
    } else {
      genSelect(el, value)
    }
  } else {
    switch (el.attrsMap.type) {
      case 'checkbox':
        genCheckboxModel(el, value, warn)
        break
      case 'radio':
        genRadioModel(el, value, warn)
        break
      default:
        return genDefaultModel(el, value, modifiers, warn)
    }
  }
}

function genCheckboxModel (el: ASTElement, value: ?string, warn: Function) {
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
      `:(${value})==(${trueValueBinding})`
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

function genRadioModel (el: ASTElement, value: ?string, warn: Function) {
  if (process.env.NODE_ENV !== 'production' &&
    el.attrsMap.checked != null) {
    warn(
      `<${el.tag} v-model="${value}" checked>:\n` +
      `inline checked attributes will be ignored when using v-model. ` +
      'Declare initial values in the component\'s data option instead.'
    )
  }
  const valueBinding = getBindingAttr(el, 'value')
  addProp(el, 'checked', `(${value})==(${valueBinding})`)
  addHandler(el, 'change', `${value}=${valueBinding}`)
}

function genDefaultModel (
  el: ASTElement,
  value: ?string,
  modifiers: ?Object,
  warn: Function
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

const getSelectedValueCode =
  'Array.prototype.filter' +
  '.call($event.target.options,function(o){return o.selected})' +
  '.map(function(o){return "_value" in o ? o._value : o.value})'

function patchChildOptions (el: ASTElement, fn: (arg: ?string) => string) {
  for (let i = 0; i < el.children.length; i++) {
    const c = el.children[i]
    if (c.type === 1 && c.tag === 'option') {
      addProp(c, 'selected', fn(getBindingAttr(c, 'value')))
    }
  }
}

function genSelect (el: ASTElement, value: ?string) {
  addHandler(el, 'change', `${value}=${getSelectedValueCode}[0]`)
  patchChildOptions(el, valueBinding => `$(${value})===(${valueBinding})`)
}

function genMultiSelect (el: ASTElement, value: ?string) {
  addHandler(el, 'change', `${value}=${getSelectedValueCode}`)
  patchChildOptions(el, valueBinding => `$(${value}).indexOf(${valueBinding})>-1`)
}
