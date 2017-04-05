/* @flow */

import VNode from './vnode'
import { createElement } from './create-element'
import { resolveSlots } from '../instance/render-helpers/resolve-slots'

import {
  isDef,
  validateProp
} from '../util/index'

export function createFunctionalComponent (
  Ctor: Class<Component>,
  propsData: ?Object,
  data: VNodeData,
  context: Component,
  children: ?Array<VNode>
): VNode | void {
  const props = {}
  const propOptions = Ctor.options.props
  if (isDef(propOptions)) {
    for (const key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData)
    }
  }
  // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check
  const _context = Object.create(context)
  const h = (a, b, c, d) => createElement(_context, a, b, c, d, true)
  const vnode = Ctor.options.render.call(null, h, {
    props,
    data,
    parent: context,
    children,
    slots: () => resolveSlots(children, context)
  })
  if (vnode instanceof VNode) {
    vnode.functionalContext = context
    if (data.slot) {
      (vnode.data || (vnode.data = {})).slot = data.slot
    }
  }
  return vnode
}
