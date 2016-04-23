import { addHandler, addProp, getBindingAttr } from 'compiler/helpers'

export default function model (el, dir) {
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

function genCheckboxModel (el, value) {
  const valueBinding = getBindingAttr(el, 'value')
  addProp(el, 'checked',
    `Array.isArray(${value})` +
      `?(${value}).indexOf(${valueBinding})>-1` +
      `:!!(${value})`
  )
  addHandler(el, 'change',
    `var $$a=${value},` +
        '$$el=$event.target,' +
        '$$c=$$el.checked;' +
    'if(Array.isArray($$a)){' +
      `var $$v=${valueBinding},` +
          '$$i=$$a.indexOf($$v);' +
      'if($$c){$$i<0&&$$a.push($$v)}' +
      'else{$$i>-1&&$$a.splice($$i,1)}' +
    `}else{${value}=$$c}`
  )
}

function genRadioModel (el, value) {
  const valueBinding = getBindingAttr(el, 'value')
  addProp(el, 'checked', `(${value}==${valueBinding})`)
  addHandler(el, 'change', `${value}=${valueBinding}`)
}

function genDefaultModel (el, value, modifiers) {
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

function patchChildOptions (el, fn) {
  for (let i = 0; i < el.children.length; i++) {
    let c = el.children[i]
    if (c.tag === 'option') {
      addProp(c, 'selected', fn(getBindingAttr(c, 'value')))
    }
  }
}

function genSelect (el, value) {
  addHandler(el, 'change', `${value}=${getSelectedValueCode}[0]`)
  patchChildOptions(el, valueBinding => `$(${value})===(${valueBinding})`)
}

function genMultiSelect (el, value) {
  addHandler(el, 'change', `${value}=${getSelectedValueCode}`)
  patchChildOptions(el, valueBinding => `$(${value}).indexOf(${valueBinding})>-1`)
}
