import { addProp } from '../../helpers'

export function text (el, dir) {
  if (!dir.value) return
  addProp(el, 'textContent', `__toString__(${dir.value})`)
}
