import { addHandler, addProp, getBindingAttr } from '../../helpers'

export function model (el, dir) {
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
  addProp(el, 'checked', `!!(${value})`)
  addHandler(el, 'change', `${value}=$event.target.checked`)
}

function genRadioModel (el, value) {
  addProp(el, 'checked', `(${value}==${getBindingAttr(el, 'value')})`)
  addHandler(el, 'change', `${value}=$event.target.value`)
}

function genDefaultModel (el, value, modifiers) {
  const type = el.attrsMap.type
  const lazy = modifiers && modifiers.lazy
  const number = modifiers && modifiers.number
  const event = lazy ? 'change' : 'input'
  const needCompositionGuard = !lazy && type !== 'range'

  let code = number || type === 'number'
    ? `${value}=Number($event.target.value)`
    : `${value}=$event.target.value`
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

function genSelect (el, value) {
  addProp(el, 'value', `(${value})`)
  addHandler(el, 'change', `${value}=$event.target.value`)
}

function genMultiSelect (el, value) {
  addHandler(el, 'change',
    `${value}=Array.prototype.filter
    .call($event.target.options,function(o){return o.selected})
    .map(function(o){return o.value})`)
  // patch child options
  for (let i = 0; i < el.children.length; i++) {
    let c = el.children[i]
    if (c.tag === 'option') {
      addProp(c, 'selected', `(${value}).indexOf(${getBindingAttr(c, 'value')})>-1`)
    }
  }
}
