import { addHandler } from '../helpers'

export function genModel (el, dir) {
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
        genDefaultModel(el, value, modifiers)
        break
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
  const event = modifiers && modifiers.lazy ? 'change' : 'input'
  const code = type === 'number' || (modifiers && modifiers.number)
    ? `${value}=Number($event.target.value)`
    : `${value}=$event.target.value`
  addHandler(el.events, event, code)
  el.props.push({
    name: 'value',
    value: `(${value})`
  })
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
