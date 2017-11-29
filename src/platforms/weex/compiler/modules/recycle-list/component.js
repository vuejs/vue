/* @flow */

import { addRawAttr } from 'compiler/helpers'
import { RECYCLE_LIST_MARKER } from 'weex/util/index'

// mark components as inside recycle-list so that we know we need to invoke
// their special @render function instead of render in create-component.js
export function preTransformComponent (
  el: ASTElement,
  options: WeexCompilerOptions
) {
  // $flow-disable-line (we know isReservedTag is there)
  if (!options.isReservedTag(el.tag) && el.tag !== 'cell-slot') {
    addRawAttr(el, RECYCLE_LIST_MARKER, 'true')
  }
}
