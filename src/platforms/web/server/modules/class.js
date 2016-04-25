import { genClassForVnode } from 'web/util/index'

export default function renderClass (node) {
  return ` class="${genClassForVnode(node)}"`
}
