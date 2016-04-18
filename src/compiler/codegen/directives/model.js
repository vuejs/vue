import { addHandler } from '../../helpers'

export function model (el, dir) {
  if (!el.events) el.events = {}
  if (!el.props) el.props = []
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
  addHandler(el.events, 'change', `${value}=$event.target.checked`)
  el.props.push({
    name: 'checked',
    value: `!!(${value})`
  })
}

function genRadioModel (el, value) {
  addHandler(el.events, 'change', `${value}=$event.target.value`)
  el.props.push({
    name: 'checked',
    value: `(${value}==${getInputValue(el)})`
  })
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
    code = `if($event.target._composing)return;${code}`
  }
  addHandler(el.events, event, code)
  el.props.push({
    name: 'value',
    value: `(${value})`
  })
  if (needCompositionGuard) {
    // return runtime directive code to help with composition events
    return '{def:__resolveDirective__("model")},'
  }
}

function genSelect (el, value) {
  addHandler(el.events, 'change', `${value}=$event.target.value`)
  el.props.push({
    name: 'value',
    value: `(${value})`
  })
}

function genMultiSelect (el, value) {
  addHandler(el.events, 'change',
    `${value}=Array.prototype.filter
    .call($event.target.options,function(o){return o.selected})
    .map(function(o){return o.value})`)
  // patch child options
  for (let i = 0; i < el.children.length; i++) {
    let c = el.children[i]
    if (c.tag === 'option') {
      (c.props || (c.props = [])).push({
        name: 'selected',
        value: `(${value}).indexOf(${getInputValue(c)})>-1`
      })
    }
  }
}

function getInputValue (el) {
  return el.attrsMap.value
    ? JSON.stringify(el.attrsMap.value)
    : el.attrsMap['v-bind:value'] || el.attrsMap[':value']
}
