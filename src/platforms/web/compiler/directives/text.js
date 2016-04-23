import { addProp } from '../../../../compiler/helpers'

export default function text (el, dir) {
  if (!dir.value) return
  addProp(el, 'textContent', `__toString__(${dir.value})`)
}
