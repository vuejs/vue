import { escape } from '../util'
import { genClassForVnode } from 'web/util/index'
import type { VNodeWithData } from 'types/vnode'

export default function renderClass(node: VNodeWithData): string | undefined {
  const classList = genClassForVnode(node)
  if (classList !== '') {
    return ` class="${escape(classList)}"`
  }
}
