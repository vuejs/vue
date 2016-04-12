import { addHandler } from './events'

export function genModel (el, events, value) {
  switch (el.attrsMap.type) {
    case 'checkbox':
      return genCheckboxModel(events, value)
    case 'radio':
      return genRadioModel(events, value)
    case 'select':
      return genSelectModel(events, value)
    default:
      return genTextModel(events, value)
  }
}

function genCheckboxModel (events, value) {
  // TODO
}

function genRadioModel (events, value) {
  // TODO
}

function genSelectModel (events, value) {
  // TODO
}

function genTextModel (events, value) {
  addHandler(events, 'input', `${value}=$event.target.value`)
  return `value:${value},`
}
