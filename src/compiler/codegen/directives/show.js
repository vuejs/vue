import { addStyleBinding } from '../../helpers'

export function show (el, dir) {
  addStyleBinding(el, 'display', `(${dir.value}?'':'none')`)
  if (el.elseBlock) {
    addStyleBinding(el.elseBlock, 'display', `(${dir.value}?'none':'')`)
  }
}
