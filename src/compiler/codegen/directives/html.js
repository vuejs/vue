import { addProp } from '../../helpers'

export function html (el, dir) {
  if (!dir.value) return
  addProp(el, 'innerHTML', `(${dir.value})`)
}
