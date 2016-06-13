/* @flow */

import { genClassForVnode } from 'web/util/index'

export default function renderClass (node: VNodeWithData): ?string {
  if (node.data.class || node.data.staticClass) {
    return ` class="${genClassForVnode(node)}"`
  }
}
