/* @flow */

import VNode from './vnode'
import { createElement } from './create-element'
import { resolveInject } from '../instance/inject'
import { resolveSlots } from '../instance/render-helpers/resolve-slots'
import { installRenderHelpers } from '../instance/render-helpers/index'

import {
  isDef,
  camelize,
  emptyObject,
  validateProp
} from '../util/index'

function FunctionalRenderContext (
  data,
  props,
  children,
  parent,
  Ctor
) {
  const options = Ctor.options
  this.data = data
  this.props = props
  this.children = children
  this.parent = parent
  this.listeners = data.on || emptyObject
  this.injections = resolveInject(options.inject, parent)
  this.slots = () => resolveSlots(children, parent)
  // support for compiled functional template
  if (options._compiled) {
    this.constructor = Ctor
    this.$options = options
    this._c = parent._c
    this.$slots = this.slots()
    this.$scopedSlots = data.scopedSlots || emptyObject
  }
}

installRenderHelpers(FunctionalRenderContext.prototype)

export function createFunctionalComponent (
  Ctor: Class<Component>,
  propsData: ?Object,
  data: VNodeData,
  contextVm: Component,
  children: ?Array<VNode>
): VNode | void {
  const options = Ctor.options
  const props = {}
  const propOptions = options.props
  if (isDef(propOptions)) {
    for (const key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData || emptyObject)
    }
  } else {
    if (isDef(data.attrs)) mergeProps(props, data.attrs)
    if (isDef(data.props)) mergeProps(props, data.props)
  }
  // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check
  const _contextVm = Object.create(contextVm)
  const h = (a, b, c, d) => createElement(_contextVm, a, b, c, d, true)
  const renderContext = new FunctionalRenderContext(
    data,
    props,
    children,
    contextVm,
    Ctor
  )
  const vnode = options.render.call(null, h, renderContext)
  if (vnode instanceof VNode) {
    vnode.functionalContext = contextVm
    vnode.functionalOptions = options
    if (data.slot) {
      (vnode.data || (vnode.data = {})).slot = data.slot
    }
  }
  return vnode
}

function mergeProps (to, from) {
  for (const key in from) {
    to[camelize(key)] = from[key]
  }
}
