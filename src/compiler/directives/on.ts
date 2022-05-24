import { warn } from 'core/util/index'

export default function on(el: ASTElement, dir: ASTDirective) {
  if (__DEV__ && dir.modifiers) {
    warn(`v-on without argument does not support modifiers.`)
  }
  el.wrapListeners = (code: string) => `_g(${code},${dir.value})`
}
