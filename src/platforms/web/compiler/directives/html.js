import { addProp } from 'compiler/helpers'

export default function html (el, dir) {
  if (!dir.value) return
  addProp(el, 'innerHTML', `__toString__(${dir.value})`)
}
